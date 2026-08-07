import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import type { AppSyncIdentity, AppSyncResolverHandler } from 'aws-lambda';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ASIN_PATTERN = /^[A-Z0-9]{10}$/;
const RESERVED_STARTER_SLUGS = new Set([
  'levitating-globe-lamp',
  'adjustable-dumbbell-set',
  'portable-pizza-oven',
  'wireless-earbuds',
]);

type ProductAction = 'CREATE' | 'UPDATE' | 'PUBLISH' | 'ARCHIVE' | 'DELETE';
type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

type ManageProductArguments = {
  action: ProductAction;
  slug: string;
  name?: string | null;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  amazonAsin?: string | null;
  retailerUrl?: string | null;
  featuredRank?: number | null;
};

type ManageProductEvent = {
  arguments: ManageProductArguments;
  identity?: AppSyncIdentity;
};

export type StoredProduct = {
  slug: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
  amazonAsin?: string;
  retailerUrl?: string;
  status: ProductStatus;
  featuredRank?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  __typename: 'Product';
};

type CommandResult = { Item?: Record<string, unknown> };
type SendCommand = (command: object) => Promise<CommandResult>;

function requireTableName() {
  const tableName = process.env.PRODUCT_TABLE_NAME;
  if (!tableName) throw new Error('Product storage is not configured.');
  return tableName;
}

function requireAdmin(identity: AppSyncIdentity | undefined) {
  if (!identity || !('claims' in identity)) throw new Error('Unauthorized');
  const groupsClaim = identity.claims?.['cognito:groups'];
  let groups: string[] = [];
  if (Array.isArray(groupsClaim)) {
    groups = groupsClaim.filter((group): group is string => typeof group === 'string');
  } else if (typeof groupsClaim === 'string') {
    try {
      const parsed = JSON.parse(groupsClaim) as unknown;
      groups = Array.isArray(parsed)
        ? parsed.filter((group): group is string => typeof group === 'string')
        : [groupsClaim];
    } catch {
      groups = groupsClaim.split(',').map((group) => group.trim());
    }
  }
  if (!groups.includes('ADMINS')) throw new Error('Unauthorized');
}

function requireString(value: string | null | undefined, label: string, min: number, max: number) {
  const normalized = value?.trim() ?? '';
  if (normalized.length < min || normalized.length > max) {
    throw new Error(`${label} must be between ${min} and ${max} characters.`);
  }
  return normalized;
}

function requireHttpsUrl(value: string | null | undefined, label: string) {
  const raw = requireString(value, label, 1, 2_048);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error(`${label} must use HTTPS and must not contain credentials.`);
  }
  if (url.port) throw new Error(`${label} must not use a custom port.`);
  return url;
}

function optionalAmazonUrl(value: string | null | undefined) {
  if (!value?.trim()) return undefined;
  const url = requireHttpsUrl(value, 'Retailer URL');
  const host = url.hostname.toLowerCase();
  if (host !== 'amazon.com' && !host.endsWith('.amazon.com') && host !== 'amzn.to') {
    throw new Error('Retailer URL must use an Amazon or amzn.to host.');
  }
  return url.toString();
}

function optionalAsin(value: string | null | undefined) {
  if (!value?.trim()) return undefined;
  const asin = value.trim().toUpperCase();
  if (!ASIN_PATTERN.test(asin)) throw new Error('Amazon ASIN must be 10 letters or digits.');
  return asin;
}

function optionalRank(value: number | null | undefined) {
  if (value === null || value === undefined) return undefined;
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new Error('Featured rank must be a whole number from 0 to 10000.');
  }
  return value;
}

function requireSlug(value: string) {
  const slug = value.trim();
  if (slug.length < 3 || slug.length > 80 || !SLUG_PATTERN.test(slug)) {
    throw new Error('Slug must be 3-80 lowercase letters, numbers, or single hyphens.');
  }
  return slug;
}

function productFromInput(
  input: ManageProductArguments,
  status: ProductStatus,
  now: string,
  existing?: StoredProduct,
): StoredProduct {
  const amazonAsin = optionalAsin(input.amazonAsin);
  const retailerUrl = optionalAmazonUrl(input.retailerUrl);
  const featuredRank = optionalRank(input.featuredRank);
  return {
    slug: requireSlug(input.slug),
    name: requireString(input.name, 'Name', 2, 120),
    description: requireString(input.description, 'Description', 20, 1_600),
    category: requireString(input.category, 'Category', 2, 60),
    imageUrl: requireHttpsUrl(input.imageUrl, 'Image URL').toString(),
    imageAlt: requireString(input.imageAlt, 'Image alt text', 5, 200),
    ...(amazonAsin ? { amazonAsin } : {}),
    ...(retailerUrl ? { retailerUrl } : {}),
    status,
    ...(featuredRank !== undefined ? { featuredRank } : {}),
    ...(existing?.publishedAt ? { publishedAt: existing.publishedAt } : {}),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    __typename: 'Product',
  };
}

function isStoredProduct(value: Record<string, unknown> | undefined): value is StoredProduct {
  return Boolean(value && typeof value.slug === 'string' && typeof value.status === 'string');
}

export function createManageProductsHandler(send: SendCommand) {
  return async (event: ManageProductEvent): Promise<Record<string, unknown>> => {
    requireAdmin(event.identity);
    const input = event.arguments;
    const slug = requireSlug(input.slug);
    if (!['CREATE', 'UPDATE', 'PUBLISH', 'ARCHIVE', 'DELETE'].includes(input.action)) {
      throw new Error('Unsupported product action.');
    }
    const TableName = requireTableName();
    const now = new Date().toISOString();

    if (input.action === 'CREATE') {
      if (RESERVED_STARTER_SLUGS.has(slug)) {
        throw new Error('This slug is reserved for starter-content migration.');
      }
      const product = productFromInput(input, 'DRAFT', now);
      await send(new PutCommand({
        TableName,
        Item: product,
        ConditionExpression: 'attribute_not_exists(slug)',
      }));
      return product;
    }

    const result = await send(new GetCommand({ TableName, Key: { slug }, ConsistentRead: true }));
    if (!isStoredProduct(result.Item)) throw new Error('Product not found.');
    const existing = result.Item;

    if (input.action === 'DELETE') {
      await send(new DeleteCommand({
        TableName,
        Key: { slug },
        ConditionExpression: 'attribute_exists(slug)',
      }));
      return { slug, deleted: true };
    }

    let product: StoredProduct;
    if (input.action === 'UPDATE') {
      product = productFromInput(input, existing.status, now, existing);
    } else if (input.action === 'PUBLISH') {
      product = { ...existing, status: 'PUBLISHED', publishedAt: now, updatedAt: now };
    } else if (input.action === 'ARCHIVE') {
      product = { ...existing, status: 'ARCHIVED', updatedAt: now };
    } else {
      throw new Error('Unsupported product action.');
    }

    await send(new PutCommand({
      TableName,
      Item: product,
      ConditionExpression: 'attribute_exists(slug)',
    }));
    return product;
  };
}

const manageProductsHandler = createManageProductsHandler(
  (command) => client.send(command as never) as Promise<CommandResult>,
);

export const handler: AppSyncResolverHandler<ManageProductArguments, Record<string, unknown>> = manageProductsHandler;
