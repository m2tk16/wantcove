import {
  BatchGetCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import type { AppSyncIdentity } from 'aws-lambda';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createManageProductsHandler, type StoredProduct } from './handler';

const adminIdentity = {
  claims: { 'cognito:groups': ['ADMINS'], email: 'admin@example.com' },
} as unknown as AppSyncIdentity;

const viewerIdentity = {
  claims: { 'cognito:groups': ['VIEWERS'] },
} as unknown as AppSyncIdentity;

const productInput = {
  action: 'CREATE' as const,
  slug: 'smart-reading-light',
  name: 'Smart Reading Light',
  description: 'A focused desk light with a flexible arm and warm color modes.',
  category: 'Home',
  imageUrl: '/products/reading-light.webp',
  imageAlt: 'Black reading light on a wooden desk',
  amazonAsin: 'B012345678',
  retailerUrl: 'https://www.amazon.com/dp/B012345678?tag=wantcove-20',
  featuredRank: 4,
};

function event(
  argumentsValue: Record<string, unknown>,
  identity: AppSyncIdentity = adminIdentity,
  fieldName = 'manageProduct',
) {
  return { arguments: argumentsValue, identity, fieldName } as never;
}

describe('manage-products Function', () => {
  beforeEach(() => {
    process.env.PRODUCT_TABLE_NAME = 'ProductTable';
  });

  it('creates only a validated draft and never trusts a client-supplied status', async () => {
    const send = vi.fn().mockResolvedValue({});
    const handler = createManageProductsHandler(send);

    const result = await handler(event({ ...productInput, status: 'PUBLISHED' }));
    expect(result.status).toBe('DRAFT');
    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(PutCommand);
    expect(command.input).toMatchObject({
      TableName: 'ProductTable',
      ConditionExpression: 'attribute_not_exists(slug)',
      Item: { slug: 'smart-reading-light', status: 'DRAFT', __typename: 'Product' },
    });
  });

  it('accepts only allowlisted first-party image paths and bounded display labels', async () => {
    const send = vi.fn().mockResolvedValue({});
    const handler = createManageProductsHandler(send);

    const result = await handler(event({
      ...productInput,
      imageUrl: '/products/reading-light.webp',
      priceLabel: '$49.99',
      ratingLabel: '4.8',
    }));
    expect(result).toMatchObject({
      imageUrl: '/products/reading-light.webp',
      priceLabel: '$49.99',
      ratingLabel: '4.8',
    });

    await expect(handler(event({
      ...productInput,
      slug: 'unsafe-image-path',
      imageUrl: '/uploads/reading-light.svg',
    }))).rejects.toThrow(/first-party \/products\//);
    await expect(handler(event({
      ...productInput,
      slug: 'external-image-host',
      imageUrl: 'https://images.example.com/reading-light.jpg',
    }))).rejects.toThrow(/first-party \/products\//);
  });

  it('rejects non-admin identities and unsafe retailer URLs before writing', async () => {
    const send = vi.fn();
    const handler = createManageProductsHandler(send);

    await expect(handler(event(productInput, viewerIdentity))).rejects.toThrow('Unauthorized');
    await expect(handler(event({ ...productInput, retailerUrl: 'https://example.com/item' }))).rejects.toThrow(/Amazon/);
    await expect(handler(event({ ...productInput, retailerUrl: 'https://www.amazon.com/dp/B012345678' }))).rejects.toThrow(/wantcove-20/);
    expect(send).not.toHaveBeenCalled();
  });

  it('accepts an Amazon-issued short Special Link', async () => {
    const send = vi.fn().mockResolvedValue({});
    const handler = createManageProductsHandler(send);
    await expect(handler(event({ ...productInput, retailerUrl: 'https://amzn.to/4fMjHIN' }))).resolves.toEqual(expect.objectContaining({ retailerUrl: 'https://amzn.to/4fMjHIN' }));
  });

  it('returns a bounded validation error when a manage-product slug is missing', async () => {
    const send = vi.fn();
    const handler = createManageProductsHandler(send);

    await expect(handler(event({ action: 'DELETE' }))).rejects.toThrow('Slug must be 3-80');
    expect(send).not.toHaveBeenCalled();
  });

  it('reserves starter slugs for the non-overwriting migration path', async () => {
    const send = vi.fn();
    const handler = createManageProductsHandler(send);

    await expect(handler(event({ ...productInput, slug: 'levitating-globe-lamp' }))).rejects.toThrow(/reserved/);
    expect(send).not.toHaveBeenCalled();
  });

  it('migrates all missing starters as published records without affiliate destinations', async () => {
    const send = vi.fn().mockResolvedValueOnce({ Responses: { ProductTable: [] } }).mockResolvedValueOnce({});
    const handler = createManageProductsHandler(send);

    const result = await handler(event({}, adminIdentity, 'migrateStarterProducts'));
    expect(result).toEqual({
      migrated: [
        'levitating-globe-lamp',
        'adjustable-dumbbell-set',
        'portable-pizza-oven',
        'wireless-earbuds',
      ],
      existing: [],
    });
    expect(send.mock.calls[0][0]).toBeInstanceOf(BatchGetCommand);
    const transaction = send.mock.calls[1][0];
    expect(transaction).toBeInstanceOf(TransactWriteCommand);
    expect(transaction.input.TransactItems).toHaveLength(4);
    for (const item of transaction.input.TransactItems) {
      expect(item.Put).toMatchObject({
        TableName: 'ProductTable',
        ConditionExpression: 'attribute_not_exists(slug)',
        Item: { status: 'PUBLISHED', __typename: 'Product' },
      });
      expect(item.Put.Item).not.toHaveProperty('amazonAsin');
      expect(item.Put.Item).not.toHaveProperty('retailerUrl');
    }
  });

  it('does not overwrite starter records that already exist', async () => {
    const send = vi.fn().mockResolvedValue({
      Responses: {
        ProductTable: [
          { slug: 'levitating-globe-lamp' },
          { slug: 'adjustable-dumbbell-set' },
          { slug: 'portable-pizza-oven' },
          { slug: 'wireless-earbuds' },
        ],
      },
    });
    const handler = createManageProductsHandler(send);

    const result = await handler(event({}, adminIdentity, 'migrateStarterProducts'));
    expect(result).toMatchObject({ migrated: [], existing: expect.arrayContaining([
      'levitating-globe-lamp',
      'adjustable-dumbbell-set',
      'portable-pizza-oven',
      'wireless-earbuds',
    ]) });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('rechecks unprocessed starter keys and transacts only records proven missing', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({
        Responses: { ProductTable: [{ slug: 'levitating-globe-lamp' }] },
        UnprocessedKeys: { ProductTable: { Keys: [{ slug: 'adjustable-dumbbell-set' }] } },
      })
      .mockResolvedValueOnce({
        Responses: { ProductTable: [{ slug: 'adjustable-dumbbell-set' }] },
      })
      .mockResolvedValueOnce({});
    const handler = createManageProductsHandler(send);

    const result = await handler(event({}, adminIdentity, 'migrateStarterProducts'));
    expect(result).toEqual({
      migrated: ['portable-pizza-oven', 'wireless-earbuds'],
      existing: ['levitating-globe-lamp', 'adjustable-dumbbell-set'],
    });
    const transaction = send.mock.calls[2][0];
    expect(transaction).toBeInstanceOf(TransactWriteCommand);
    expect(transaction.input.TransactItems.map((item: { Put: { Item: { slug: string } } }) => item.Put.Item.slug)).toEqual([
      'portable-pizza-oven',
      'wireless-earbuds',
    ]);
  });

  it('rejects a non-admin starter migration before reading storage', async () => {
    const send = vi.fn();
    const handler = createManageProductsHandler(send);

    await expect(handler(event({}, viewerIdentity, 'migrateStarterProducts'))).rejects.toThrow('Unauthorized');
    expect(send).not.toHaveBeenCalled();
  });

  it('publishes an existing product using a server timestamp', async () => {
    const existing: StoredProduct = {
      ...productInput,
      status: 'DRAFT',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
      __typename: 'Product',
    };
    const send = vi.fn().mockResolvedValueOnce({ Item: existing }).mockResolvedValueOnce({});
    const handler = createManageProductsHandler(send);

    const result = await handler(event({ action: 'PUBLISH', slug: existing.slug }));
    expect(result.status).toBe('PUBLISHED');
    expect(typeof result.publishedAt).toBe('string');
    expect(send.mock.calls[0][0]).toBeInstanceOf(GetCommand);
    expect(send.mock.calls[1][0]).toBeInstanceOf(PutCommand);
  });

  it('updates content without allowing the lifecycle state to change', async () => {
    const existing: StoredProduct = {
      ...productInput,
      status: 'PUBLISHED',
      publishedAt: '2026-08-02T00:00:00.000Z',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-02T00:00:00.000Z',
      __typename: 'Product',
    };
    const send = vi.fn().mockResolvedValueOnce({ Item: existing }).mockResolvedValueOnce({});
    const handler = createManageProductsHandler(send);

    const result = await handler(event({ ...productInput, action: 'UPDATE', name: 'Updated Reading Light', status: 'ARCHIVED' }));
    expect(result).toMatchObject({ name: 'Updated Reading Light', status: 'PUBLISHED', publishedAt: existing.publishedAt });
    expect(send.mock.calls[1][0].input.ConditionExpression).toBe('attribute_exists(slug)');
  });

  it('archives an existing product and accepts the serialized Cognito group claim', async () => {
    const existing: StoredProduct = {
      ...productInput,
      slug: 'levitating-globe-lamp',
      status: 'PUBLISHED',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-02T00:00:00.000Z',
      __typename: 'Product',
    };
    const serializedAdmin = { claims: { 'cognito:groups': '["ADMINS"]' } } as unknown as AppSyncIdentity;
    const send = vi.fn().mockResolvedValueOnce({ Item: existing }).mockResolvedValueOnce({});
    const handler = createManageProductsHandler(send);

    const result = await handler(event({ action: 'ARCHIVE', slug: existing.slug }, serializedAdmin));
    expect(result.status).toBe('ARCHIVED');
  });

  it('deletes only a record that already exists', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({ Item: { ...productInput, status: 'ARCHIVED', __typename: 'Product' } })
      .mockResolvedValueOnce({});
    const handler = createManageProductsHandler(send);

    await expect(handler(event({ action: 'DELETE', slug: productInput.slug }))).resolves.toEqual({
      slug: productInput.slug,
      deleted: true,
    });
    expect(send.mock.calls[1][0]).toBeInstanceOf(DeleteCommand);
    expect(send.mock.calls[1][0].input.ConditionExpression).toBe('attribute_exists(slug)');
  });
});
