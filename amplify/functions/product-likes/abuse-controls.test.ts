import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { describe, expect, it, vi } from 'vitest';
import {
  enforceProductLikeRateLimit,
  PRODUCT_LIKE_RATE_LIMIT_MAX_REQUESTS,
  PRODUCT_LIKE_RATE_LIMIT_TTL_SECONDS,
  PRODUCT_LIKE_RATE_LIMIT_WINDOW_SECONDS,
} from './abuse-controls';

const nowSeconds = 1_700_000_012;

describe('product-like abuse controls', () => {
  it('uses a server-derived, short-lived fixed-window counter', async () => {
    const send = vi.fn().mockResolvedValue({});

    await enforceProductLikeRateLimit({
      send,
      tableName: 'ProductLikesTable',
      actorKey: 'us-east-1:device-123',
      nowSeconds,
    });

    const command = send.mock.calls[0][0];
    const windowStart = Math.floor(nowSeconds / PRODUCT_LIKE_RATE_LIMIT_WINDOW_SECONDS) * PRODUCT_LIKE_RATE_LIMIT_WINDOW_SECONDS;
    expect(command).toBeInstanceOf(UpdateCommand);
    expect(command.input).toMatchObject({
      TableName: 'ProductLikesTable',
      Key: {
        productSlug: '__rate_limit__#us-east-1:device-123',
        actorKey: `window#${windowStart}`,
      },
      ConditionExpression: 'attribute_not_exists(requestCount) OR requestCount < :limit',
      ExpressionAttributeValues: {
        ':expiresAt': nowSeconds + PRODUCT_LIKE_RATE_LIMIT_TTL_SECONDS,
        ':one': 1,
        ':limit': PRODUCT_LIKE_RATE_LIMIT_MAX_REQUESTS,
      },
    });
  });

  it('returns a bounded error and emits only an aggregate metric when the limit is reached', async () => {
    const conditionalFailure = Object.assign(new Error('database details'), {
      name: 'ConditionalCheckFailedException',
    });
    const send = vi.fn().mockRejectedValue(conditionalFailure);
    const writeMetric = vi.fn();

    await expect(enforceProductLikeRateLimit({
      send,
      tableName: 'ProductLikesTable',
      actorKey: 'us-east-1:private-device',
      nowSeconds,
      writeMetric,
    })).rejects.toThrow('Too many like requests. Please try again shortly.');

    expect(writeMetric).toHaveBeenCalledOnce();
    const metric = writeMetric.mock.calls[0][0];
    expect(JSON.parse(metric)).toMatchObject({
      _aws: {
        Timestamp: nowSeconds * 1000,
        CloudWatchMetrics: [{
          Namespace: 'WantCove/ProductLikes',
          Dimensions: [[]],
          Metrics: [{ Name: 'RateLimitedRequests', Unit: 'Count' }],
        }],
      },
      RateLimitedRequests: 1,
    });
    expect(metric).not.toContain('private-device');
    expect(metric).not.toContain('productSlug');
    expect(metric).not.toContain('sourceIp');
    expect(metric).not.toContain('database details');
  });

  it('does not hide infrastructure failures as rate-limit responses', async () => {
    const send = vi.fn().mockRejectedValue(new Error('DynamoDB unavailable'));

    await expect(enforceProductLikeRateLimit({
      send,
      tableName: 'ProductLikesTable',
      actorKey: 'us-east-1:device-123',
      nowSeconds,
      writeMetric: vi.fn(),
    })).rejects.toThrow('DynamoDB unavailable');
  });
});
