import { DeleteCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
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
  imageUrl: 'https://images.example.com/reading-light.jpg',
  imageAlt: 'Black reading light on a wooden desk',
  amazonAsin: 'B012345678',
  retailerUrl: 'https://www.amazon.com/dp/B012345678?tag=wantcove-20',
  featuredRank: 4,
};

function event(argumentsValue: Record<string, unknown>, identity: AppSyncIdentity = adminIdentity) {
  return { arguments: argumentsValue, identity } as never;
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

  it('rejects non-admin identities and unsafe retailer URLs before writing', async () => {
    const send = vi.fn();
    const handler = createManageProductsHandler(send);

    await expect(handler(event(productInput, viewerIdentity))).rejects.toThrow('Unauthorized');
    await expect(handler(event({ ...productInput, retailerUrl: 'https://example.com/item' }))).rejects.toThrow(/Amazon/);
    expect(send).not.toHaveBeenCalled();
  });

  it('reserves starter slugs so an archived managed record cannot reveal its fixture fallback', async () => {
    const send = vi.fn();
    const handler = createManageProductsHandler(send);

    await expect(handler(event({ ...productInput, slug: 'levitating-globe-lamp' }))).rejects.toThrow(/reserved/);
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
