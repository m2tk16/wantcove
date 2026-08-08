import { DeleteCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { AppSyncIdentity } from 'aws-lambda';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProductLikesHandler } from './handler';

const identity = { cognitoIdentityId: 'us-east-1:device-123' } as AppSyncIdentity;

function event(argumentsValue: { productSlug: string; liked?: boolean }, eventIdentity: AppSyncIdentity = identity) {
  return { arguments: argumentsValue, identity: eventIdentity };
}

describe('product-likes Function', () => {
  beforeEach(() => {
    process.env.PRODUCT_LIKES_TABLE_NAME = 'ProductLikesTable';
    process.env.PRODUCT_TABLE_NAME = 'ProductTable';
  });

  it('reads only the server-derived identity key and honors an unexpired like', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({ Item: { status: 'PUBLISHED' } })
      .mockResolvedValueOnce({ Item: { expiresAt: Math.floor(Date.now() / 1000) + 60 } });
    const handler = createProductLikesHandler(send);

    await expect(handler(event({ productSlug: 'levitating-globe-lamp' }))).resolves.toBe(true);
    expect(send.mock.calls[0][0]).toBeInstanceOf(GetCommand);
    expect(send.mock.calls[0][0].input).toMatchObject({
      TableName: 'ProductTable',
      Key: { slug: 'levitating-globe-lamp' },
      ConsistentRead: true,
    });
    expect(send.mock.calls[1][0]).toBeInstanceOf(GetCommand);
    expect(send.mock.calls[1][0].input).toMatchObject({
      TableName: 'ProductLikesTable',
      Key: { productSlug: 'levitating-globe-lamp', actorKey: 'us-east-1:device-123' },
      ConsistentRead: true,
    });
  });

  it('stores a bounded like record', async () => {
    const send = vi.fn().mockResolvedValueOnce({ Item: { status: 'PUBLISHED' } }).mockResolvedValueOnce({});
    const handler = createProductLikesHandler(send);
    const before = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 180;

    await expect(handler(event({ productSlug: 'portable-pizza-oven', liked: true }))).resolves.toBe(true);
    const command = send.mock.calls[1][0];
    expect(command).toBeInstanceOf(PutCommand);
    expect(command.input.Item).toMatchObject({
      productSlug: 'portable-pizza-oven',
      actorKey: 'us-east-1:device-123',
    });
    expect(command.input.Item?.expiresAt).toBeGreaterThanOrEqual(before);
  });

  it('deletes the identity-scoped row when unliked', async () => {
    const send = vi.fn().mockResolvedValueOnce({ Item: { status: 'PUBLISHED' } }).mockResolvedValueOnce({});
    const handler = createProductLikesHandler(send);

    await expect(handler(event({ productSlug: 'wireless-earbuds', liked: false }))).resolves.toBe(false);
    const command = send.mock.calls[1][0];
    expect(command).toBeInstanceOf(DeleteCommand);
    expect(command.input.Key).toEqual({ productSlug: 'wireless-earbuds', actorKey: 'us-east-1:device-123' });
  });

  it('rejects unknown products and identities without a Cognito Identity ID', async () => {
    const send = vi.fn().mockResolvedValue({});
    const handler = createProductLikesHandler(send);

    await expect(handler(event({ productSlug: 'unknown-product' }))).rejects.toThrow('Unknown product.');
    await expect(handler(event({ productSlug: 'levitating-globe-lamp' }, null))).rejects.toThrow('Unauthorized');
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('rejects a like when the Product table does not mark the product published', async () => {
    const send = vi.fn().mockResolvedValueOnce({ Item: { status: 'DRAFT' } });
    const handler = createProductLikesHandler(send);

    await expect(handler(event({ productSlug: 'smart-reading-light' }))).rejects.toThrow('Unknown product.');
    expect(send.mock.calls[0][0].input).toMatchObject({
      TableName: 'ProductTable',
      Key: { slug: 'smart-reading-light' },
    });
    expect(send).toHaveBeenCalledTimes(1);
  });
});
