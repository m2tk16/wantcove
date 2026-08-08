import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import type { AppSyncResolverHandler } from 'aws-lambda';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROJECTION = 'slug, #name, description, category, imageUrl, imageAlt, priceLabel, ratingLabel, featuredRank, publishedAt';

type PublicCatalogArguments = { slug?: string };
type PublicCatalogEvent = { arguments: PublicCatalogArguments };
type CommandResult = {
  Item?: Record<string, unknown>;
  Items?: Record<string, unknown>[];
  LastEvaluatedKey?: Record<string, unknown>;
};
type SendCommand = (command: object) => Promise<CommandResult>;

function requireTableName() {
  const tableName = process.env.PRODUCT_TABLE_NAME;
  if (!tableName) throw new Error('Product storage is not configured.');
  return tableName;
}

function publicProduct(item: Record<string, unknown> | undefined) {
  if (!item || item.status !== 'PUBLISHED') return null;
  return {
    slug: item.slug,
    name: item.name,
    description: item.description,
    category: item.category,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    priceLabel: item.priceLabel,
    ratingLabel: item.ratingLabel,
    featuredRank: item.featuredRank,
    publishedAt: item.publishedAt,
  };
}

export function createPublicCatalogHandler(send: SendCommand) {
  return async (event: PublicCatalogEvent): Promise<unknown> => {
    const TableName = requireTableName();
    const slug = event.arguments.slug?.trim();

    if (slug !== undefined) {
      if (slug.length > 80 || !SLUG_PATTERN.test(slug)) throw new Error('Invalid product slug.');
      const result = await send(new GetCommand({
        TableName,
        Key: { slug },
        ConsistentRead: true,
      }));
      return publicProduct(result.Item);
    }

    const records: Record<string, unknown>[] = [];
    let ExclusiveStartKey: Record<string, unknown> | undefined;
    do {
      const result = await send(new ScanCommand({
        TableName,
        ExclusiveStartKey,
        FilterExpression: '#status = :published',
        ExpressionAttributeNames: { '#status': 'status', '#name': 'name' },
        ExpressionAttributeValues: { ':published': 'PUBLISHED' },
        ProjectionExpression: `${PROJECTION}, #status`,
      }));
      records.push(...(result.Items ?? []));
      ExclusiveStartKey = result.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return records
      .map(publicProduct)
      .filter((item) => item !== null)
      .sort((left, right) => {
        const leftRank = typeof left.featuredRank === 'number' ? left.featuredRank : Number.MAX_SAFE_INTEGER;
        const rightRank = typeof right.featuredRank === 'number' ? right.featuredRank : Number.MAX_SAFE_INTEGER;
        return leftRank - rightRank || String(left.name).localeCompare(String(right.name));
      });
  };
}

const publicCatalogHandler = createPublicCatalogHandler(
  (command) => client.send(command as never) as Promise<CommandResult>,
);

export const handler: AppSyncResolverHandler<PublicCatalogArguments, unknown> = publicCatalogHandler;
