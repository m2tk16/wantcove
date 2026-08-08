import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchGetCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import type { AppSyncIdentity, AppSyncResolverHandler } from 'aws-lambda';
import { STARTER_PRODUCTS } from './starter-products';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ASIN_PATTERN = /^[A-Z0-9]{10}$/;
const FIRST_PARTY_PRODUCT_IMAGE_PATTERN = /^\/products\/[a-z0-9]+(?:[.-][a-z0-9]+)*\.(?:avif|jpe?g|png|webp)$/;
const RESERVED_STARTER_SLUGS = new Set(STARTER_PRODUCTS.map(({ slug }) => slug));

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
  priceLabel?: string | null;
  ratingLabel?: string | null;
  amazonAsin?: string | null;
  retailerUrl?: string | null;
  featuredRank?: number | null;
};

type ManageProductEvent = {
  arguments: ManageProductArguments;
  identity?: AppSyncIdentity;
  info?: { fieldName?: string };
};

export type StoredProduct = {
  slug: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
  priceLabel?: string;
  ratingLabel?: string;
  amazonAsin?: string;
  retailerUrl?: string;
  status: ProductStatus;
  featuredRank?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  __typename: 'Product';
};

type CommandResult = {
  Item?: Record<string, unknown>;
  Responses?: Record<string, Record<string, unknown>[]>;
  UnprocessedKeys?: Record<string, { Keys?: Record<string, unknown>[] }>;
};
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

function requireImageLocation(value: string | null | undefined) {
  const raw = requireString(value, 'Image location', 1, 2_048);
  if (raw.startsWith('/')) {
    if (!FIRST_PARTY_PRODUCT_IMAGE_PATTERN.test(raw)) {
      throw new Error('Image location must use a safe /products/ image path.');
    }
    return raw;
  }
  return requireHttpsUrl(raw, 'Image location').toString();
}

function optionalDisplayLabel(value: string | null | undefined, label: string, max: number) {
  if (!value?.trim()) return undefined;
  return requireString(value, label, 1, max);
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
  const priceLabel = optionalDisplayLabel(input.priceLabel, 'Display price', 32);
  const ratingLabel = optionalDisplayLabel(input.ratingLabel, 'Display rating', 16);
  return {
    slug: requireSlug(input.slug),
    name: requireString(input.name, 'Name', 2, 120),
    description: requireString(input.description, 'Description', 20, 1_600),
    category: requireString(input.category, 'Category', 2, 60),
    imageUrl: requireImageLocation(input.imageUrl),
    imageAlt: requireString(input.imageAlt, 'Image alt text', 5, 200),
    ...(priceLabel ? { priceLabel } : {}),
    ...(ratingLabel ? { ratingLabel } : {}),
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

async function migrateStarterProducts(send: SendCommand, TableName: string, now: string) {
  const existingSlugs = new Set<string>();
  let pendingKeys: Record<string, unknown>[] = STARTER_PRODUCTS.map(({ slug }) => ({ slug }));
  let attempts = 0;

  while (pendingKeys.length > 0) {
    if (attempts >= 3) throw new Error('Product storage is busy. Retry the starter migration.');
    const result = await send(new BatchGetCommand({
      RequestItems: {
        [TableName]: {
          Keys: pendingKeys,
          ProjectionExpression: 'slug',
          ConsistentRead: true,
        },
      },
    }));
    for (const item of result.Responses?.[TableName] ?? []) {
      if (typeof item.slug === 'string') existingSlugs.add(item.slug);
    }
    pendingKeys = result.UnprocessedKeys?.[TableName]?.Keys ?? [];
    attempts += 1;
  }
  const missingProducts = STARTER_PRODUCTS.filter(({ slug }) => !existingSlugs.has(slug));

  if (missingProducts.length > 0) {
    await send(new TransactWriteCommand({
      TransactItems: missingProducts.map((product) => ({
        Put: {
          TableName,
          Item: {
            ...product,
            status: 'PUBLISHED',
            publishedAt: now,
            createdAt: now,
            updatedAt: now,
            __typename: 'Product',
          },
          ConditionExpression: 'attribute_not_exists(slug)',
        },
      })),
    }));
  }

  return {
    migrated: missingProducts.map(({ slug }) => slug),
    existing: STARTER_PRODUCTS.filter(({ slug }) => existingSlugs.has(slug)).map(({ slug }) => slug),
  };
}

function isStoredProduct(value: Record<string, unknown> | undefined): value is StoredProduct {
  return Boolean(value && typeof value.slug === 'string' && typeof value.status === 'string');
}

export function createManageProductsHandler(send: SendCommand) {
  return async (event: ManageProductEvent): Promise<Record<string, unknown>> => {
    requireAdmin(event.identity);
    const TableName = requireTableName();
    const now = new Date().toISOString();

    if (event.info?.fieldName === 'migrateStarterProducts') {
      return migrateStarterProducts(send, TableName, now);
    }

    const input = event.arguments;
    const slug = requireSlug(input.slug);
    if (!['CREATE', 'UPDATE', 'PUBLISH', 'ARCHIVE', 'DELETE'].includes(input.action)) {
      throw new Error('Unsupported product action.');
    }

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

    if (RESERVED_STARTER_SLUGS.has(slug) && (input.action === 'ARCHIVE' || input.action === 'DELETE')) {
      throw new Error('Starter products cannot be archived or deleted while fixture fallback is active.');
    }

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
