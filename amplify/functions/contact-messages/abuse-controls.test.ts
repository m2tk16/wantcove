import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { describe, expect, it, vi } from 'vitest';
import {
  CONTACT_RATE_LIMIT_MAX_REQUESTS,
  CONTACT_RATE_LIMIT_TTL_SECONDS,
  CONTACT_RATE_LIMIT_WINDOW_SECONDS,
  enforceContactRateLimit,
} from './abuse-controls';

const nowSeconds = 1_700_000_012;

describe('contact-message abuse controls', () => {
  it('uses a server-derived, short-lived fixed-window counter', async () => {
    const send = vi.fn().mockResolvedValue({});
    await enforceContactRateLimit({ send, tableName: 'ContactTable', actorKey: 'us-east-1:guest-123', nowSeconds });
    const command = send.mock.calls[0][0];
    const windowStart = Math.floor(nowSeconds / CONTACT_RATE_LIMIT_WINDOW_SECONDS) * CONTACT_RATE_LIMIT_WINDOW_SECONDS;
    expect(command).toBeInstanceOf(UpdateCommand);
    expect(command.input).toMatchObject({
      Key: { id: `RATE#us-east-1:guest-123#${windowStart}` },
      ConditionExpression: 'attribute_not_exists(requestCount) OR requestCount < :limit',
      ExpressionAttributeValues: {
        ':expiresAt': nowSeconds + CONTACT_RATE_LIMIT_TTL_SECONDS,
        ':one': 1,
        ':limit': CONTACT_RATE_LIMIT_MAX_REQUESTS,
      },
    });
  });

  it('emits an aggregate metric without identity or message data when limited', async () => {
    const send = vi.fn().mockRejectedValue(Object.assign(new Error('private failure'), { name: 'ConditionalCheckFailedException' }));
    const writeMetric = vi.fn();
    await expect(enforceContactRateLimit({ send, tableName: 'ContactTable', actorKey: 'private-guest', nowSeconds, writeMetric })).rejects.toThrow('Too many contact requests');
    const metric = writeMetric.mock.calls[0][0];
    expect(JSON.parse(metric)).toMatchObject({
      _aws: { CloudWatchMetrics: [{ Namespace: 'WantCove/ContactMessages', Dimensions: [[]] }] },
      RateLimitedRequests: 1,
    });
    expect(metric).not.toContain('private-guest');
    expect(metric).not.toContain('private failure');
  });

  it('propagates infrastructure failures', async () => {
    const send = vi.fn().mockRejectedValue(new Error('DynamoDB unavailable'));
    await expect(enforceContactRateLimit({ send, tableName: 'ContactTable', actorKey: 'guest', nowSeconds })).rejects.toThrow('DynamoDB unavailable');
  });
});
