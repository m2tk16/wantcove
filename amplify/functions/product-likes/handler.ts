import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import type { AppSyncIdentity, AppSyncResolverHandler } from 'aws-lambda';
import { enforceProductLikeRateLimit, isConditionalCheckFailed } from './abuse-controls';

const PRODUCT_LIKE_TTL_SECONDS = 60 * 60 * 24 * 180;
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

type ProductLikeArguments = {
  productSlug: string;
  liked?: boolean;
};

function requireTableName() {
  const tableName = process.env.PRODUCT_LIKES_TABLE_NAME;
  if (!tableName) throw new Error('Product likes table is not configured.');
  return tableName;
}

function requireProductTableName() {
  const tableName = process.env.PRODUCT_TABLE_NAME;
  if (!tableName) throw new Error('Product storage is not configured.');
  return tableName;
}

type ProductLikeEvent = {
  arguments: ProductLikeArguments;
  identity?: AppSyncIdentity;
};

type CommandResult = { Item?: Record<string, unknown> };
type SendCommand = (command: object) => Promise<CommandResult>;

function requireActorKey(identity: AppSyncIdentity) {
  if (!identity || !('cognitoIdentityId' in identity) || !identity.cognitoIdentityId) {
    throw new Error('Unauthorized');
  }
  return identity.cognitoIdentityId;
}

export function createProductLikesHandler(send: SendCommand, now = () => Date.now()) {
  return async (event: ProductLikeEvent): Promise<boolean> => {
    const { productSlug, liked } = event.arguments;
    const actorKey = requireActorKey(event.identity);
    const TableName = requireTableName();
    const nowSeconds = Math.floor(now() / 1000);
    await enforceProductLikeRateLimit({
      send,
      tableName: TableName,
      actorKey,
      nowSeconds,
    });
    if (typeof productSlug !== 'string' || productSlug.length > 80 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(productSlug)) {
      throw new Error('Unknown product.');
    }

    const product = await send(new GetCommand({
      TableName: requireProductTableName(),
      Key: { slug: productSlug },
      ConsistentRead: true,
      ProjectionExpression: '#status',
      ExpressionAttributeNames: { '#status': 'status' },
    }));
    if (product.Item?.status !== 'PUBLISHED') throw new Error('Unknown product.');

    const Key = { productSlug, actorKey };

    if (liked === undefined) {
      const result = await send(new GetCommand({
        TableName,
        Key,
        ConsistentRead: true,
        ProjectionExpression: 'expiresAt',
      }));
      return Boolean(
        typeof result.Item?.expiresAt === 'number' &&
          result.Item.expiresAt > nowSeconds,
      );
    }

    if (typeof liked !== 'boolean') {
      throw new Error('Unsupported product-like operation.');
    }

    if (liked) {
      try {
        await send(new PutCommand({
          TableName,
          Item: {
            ...Key,
            expiresAt: nowSeconds + PRODUCT_LIKE_TTL_SECONDS,
          },
          ConditionExpression: 'attribute_not_exists(productSlug) OR expiresAt <= :now',
          ExpressionAttributeValues: { ':now': nowSeconds },
        }));
      } catch (error) {
        if (!isConditionalCheckFailed(error)) throw error;
      }
    } else {
      try {
        await send(new DeleteCommand({
          TableName,
          Key,
          ConditionExpression: 'attribute_exists(productSlug)',
        }));
      } catch (error) {
        if (!isConditionalCheckFailed(error)) throw error;
      }
    }

    return liked;
  };
}

const productLikesHandler = createProductLikesHandler(
  (command) => client.send(command as never) as Promise<CommandResult>,
);

export const handler: AppSyncResolverHandler<ProductLikeArguments, boolean> = productLikesHandler;
