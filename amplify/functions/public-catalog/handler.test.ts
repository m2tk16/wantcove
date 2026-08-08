import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPublicCatalogHandler } from './handler';

describe('public-catalog Function', () => {
  beforeEach(() => {
    process.env.PRODUCT_TABLE_NAME = 'ProductTable';
  });

  it('returns only published products in featured order', async () => {
    const send = vi.fn().mockResolvedValue({
      Items: [
        { slug: 'second', name: 'Second', status: 'PUBLISHED', featuredRank: 2, priceLabel: '$29.99', ratingLabel: '4.6' },
        { slug: 'hidden', name: 'Hidden', status: 'DRAFT', featuredRank: 1 },
        { slug: 'first', name: 'First', status: 'PUBLISHED', featuredRank: 1 },
      ],
    });
    const handler = createPublicCatalogHandler(send);

    await expect(handler({ arguments: {} })).resolves.toEqual([
      expect.objectContaining({ slug: 'first' }),
      expect.objectContaining({ slug: 'second', priceLabel: '$29.99', ratingLabel: '4.6' }),
    ]);
    expect(send.mock.calls[0][0]).toBeInstanceOf(ScanCommand);
    expect(send.mock.calls[0][0].input.FilterExpression).toBe('#status = :published');
  });

  it('does not return a draft from the single-product query', async () => {
    const send = vi.fn().mockResolvedValue({ Item: { slug: 'hidden', status: 'DRAFT' } });
    const handler = createPublicCatalogHandler(send);

    await expect(handler({ arguments: { slug: 'hidden' } })).resolves.toBeNull();
    expect(send.mock.calls[0][0]).toBeInstanceOf(GetCommand);
  });

  it('follows pagination without exposing internal fields', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce({
        Items: [{ slug: 'first', name: 'First', status: 'PUBLISHED', internal: 'secret', amazonAsin: 'B012345678', retailerUrl: 'https://www.amazon.com/dp/B012345678' }],
        LastEvaluatedKey: { slug: 'first' },
      })
      .mockResolvedValueOnce({
        Items: [{ slug: 'second', name: 'Second', status: 'PUBLISHED' }],
      });
    const handler = createPublicCatalogHandler(send);

    const result = await handler({ arguments: {} }) as Record<string, unknown>[];
    expect(result).toHaveLength(2);
    expect(result[0]).not.toHaveProperty('internal');
    expect(result[0]).not.toHaveProperty('amazonAsin');
    expect(result[0]).not.toHaveProperty('retailerUrl');
    expect(send.mock.calls[1][0].input.ExclusiveStartKey).toEqual({ slug: 'first' });
  });
});
