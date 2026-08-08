import { DeleteCommand, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { AppSyncIdentity } from 'aws-lambda';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProductLikesHandler } from './handler';

const identity = { cognitoIdentityId: 'us-east-1:device-123' } as AppSyncIdentity;
const nowMilliseconds = 1_700_000_012_000;
const nowSeconds = Math.floor(nowMilliseconds / 1000);

function event(argumentsValue: { productSlug: string; liked?: boolean }, eventIdentity: AppSyncIdentity = identity) {
  return { arguments: argumentsValue, identity: eventIdentity };
}

function conditionalFailure() {
  return Object.assign(new Error('condition failed'), { name: 'ConditionalCheckFailedException' });
}

describe('product-likes Function', () => {
  beforeEach(() => {
    process.env.PRODUCT_LIKES_TABLE_NAME = 'ProductLikesTable';
    process.env.PRODUCT_TABLE_NAME = 'ProductTable';
  });

  it('rate-limits first, then reads only the server-derived identity key and honors an unexpired like', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ Item: { status: 'PUBLISHED' } })
      .mockResolvedValueOnce({ Item: { expiresAt: nowSeconds + 60 } });
    const handler = createProductLikesHandler(send, () => nowMilliseconds);

    await expect(handler(event({ productSlug: 'levitating-globe-lamp' }))).resolves.toBe(true);
    expect(send.mock.calls[0][0]).toBeInstanceOf(UpdateCommand);
    expect(send.mock.calls[0][0].input.Key).toMatchObject({
      productSlug: '__rate_limit__#us-east-1:device-123',
    });
    expect(send.mock.calls[1][0]).toBeInstanceOf(GetCommand);
    expect(send.mock.calls[1][0].input).toMatchObject({
      TableName: 'ProductTable',
      Key: { slug: 'levitating-globe-lamp' },
      ConsistentRead: true,
    });
    expect(send.mock.calls[2][0]).toBeInstanceOf(GetCommand);
    expect(send.mock.calls[2][0].input).toMatchObject({
      TableName: 'ProductLikesTable',
      Key: { productSlug: 'levitating-globe-lamp', actorKey: 'us-east-1:device-123' },
      ConsistentRead: true,
    });
  });

  it('stores a bounded like record without extending an existing unexpired record', async () => {
    const send = vi.fn().mockResolvedValueOnce({}).mockResolvedValueOnce({ Item: { status: 'PUBLISHED' } }).mockResolvedValueOnce({});
    const handler = createProductLikesHandler(send, () => nowMilliseconds);

    await expect(handler(event({ productSlug: 'portable-pizza-oven', liked: true }))).resolves.toBe(true);
    const command = send.mock.calls[2][0];
    expect(command).toBeInstanceOf(PutCommand);
    expect(command.input).toMatchObject({
      Item: {
        productSlug: 'portable-pizza-oven',
        actorKey: 'us-east-1:device-123',
        expiresAt: nowSeconds + 60 * 60 * 24 * 180,
      },
      ConditionExpression: 'attribute_not_exists(productSlug) OR expiresAt <= :now',
      ExpressionAttributeValues: { ':now': nowSeconds },
    });
  });

  it('treats a repeated like as an idempotent success', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ Item: { status: 'PUBLISHED' } })
      .mockRejectedValueOnce(conditionalFailure());
    const handler = createProductLikesHandler(send, () => nowMilliseconds);

    await expect(handler(event({ productSlug: 'portable-pizza-oven', liked: true }))).resolves.toBe(true);
  });

  it('conditionally deletes the identity-scoped row and treats a missing row as success', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ Item: { status: 'PUBLISHED' } })
      .mockRejectedValueOnce(conditionalFailure());
    const handler = createProductLikesHandler(send, () => nowMilliseconds);

    await expect(handler(event({ productSlug: 'wireless-earbuds', liked: false }))).resolves.toBe(false);
    const command = send.mock.calls[2][0];
    expect(command).toBeInstanceOf(DeleteCommand);
    expect(command.input).toMatchObject({
      Key: { productSlug: 'wireless-earbuds', actorKey: 'us-east-1:device-123' },
      ConditionExpression: 'attribute_exists(productSlug)',
    });
  });

  it('rejects unknown products and identities without a Cognito Identity ID', async () => {
    const send = vi.fn().mockResolvedValue({});
    const handler = createProductLikesHandler(send, () => nowMilliseconds);

    await expect(handler(event({ productSlug: 'unknown-product' }))).rejects.toThrow('Unknown product.');
    expect(send).toHaveBeenCalledTimes(2);
    await expect(handler(event({ productSlug: 'levitating-globe-lamp' }, null))).rejects.toThrow('Unauthorized');
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('charges malformed requests to the server-derived identity limit before rejecting them', async () => {
    const send = vi.fn().mockResolvedValue({});
    const handler = createProductLikesHandler(send, () => nowMilliseconds);

    await expect(handler(event({ productSlug: '../not-a-product' }))).rejects.toThrow('Unknown product.');
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][0]).toBeInstanceOf(UpdateCommand);
    expect(send.mock.calls[0][0].input.Key).toMatchObject({
      productSlug: '__rate_limit__#us-east-1:device-123',
    });
  });

  it('rejects a like when the Product table does not mark the product published', async () => {
    const send = vi.fn().mockResolvedValueOnce({}).mockResolvedValueOnce({ Item: { status: 'DRAFT' } });
    const handler = createProductLikesHandler(send, () => nowMilliseconds);

    await expect(handler(event({ productSlug: 'smart-reading-light' }))).rejects.toThrow('Unknown product.');
    expect(send.mock.calls[1][0].input).toMatchObject({
      TableName: 'ProductTable',
      Key: { slug: 'smart-reading-light' },
    });
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('propagates non-conditional write failures', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ Item: { status: 'PUBLISHED' } })
      .mockRejectedValueOnce(new Error('DynamoDB unavailable'));
    const handler = createProductLikesHandler(send, () => nowMilliseconds);

    await expect(handler(event({ productSlug: 'portable-pizza-oven', liked: true }))).rejects.toThrow('DynamoDB unavailable');
  });
});
