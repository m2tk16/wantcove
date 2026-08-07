import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import type { AppSyncIdentity, AppSyncResolverHandler } from 'aws-lambda';

const PRODUCT_LIKE_TTL_SECONDS = 60 * 60 * 24 * 180;
const productSlugs = new Set([
  'levitating-globe-lamp',
  'adjustable-dumbbell-set',
  'portable-pizza-oven',
  'wireless-earbuds',
]);
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

export function createProductLikesHandler(send: SendCommand) {
  return async (event: ProductLikeEvent): Promise<boolean> => {
    const { productSlug, liked } = event.arguments;
    if (!productSlugs.has(productSlug)) throw new Error('Unknown product.');

    const actorKey = requireActorKey(event.identity);
    const TableName = requireTableName();
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
          result.Item.expiresAt > Math.floor(Date.now() / 1000),
      );
    }

    if (typeof liked !== 'boolean') {
      throw new Error('Unsupported product-like operation.');
    }

    if (liked) {
      await send(new PutCommand({
        TableName,
        Item: {
          ...Key,
          expiresAt: Math.floor(Date.now() / 1000) + PRODUCT_LIKE_TTL_SECONDS,
        },
      }));
    } else {
      await send(new DeleteCommand({ TableName, Key }));
    }

    return liked;
  };
}

const productLikesHandler = createProductLikesHandler(
  (command) => client.send(command as never) as Promise<CommandResult>,
);

export const handler: AppSyncResolverHandler<ProductLikeArguments, boolean> = productLikesHandler;
