import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

export const CONTACT_RATE_LIMIT_MAX_REQUESTS = 5;
export const CONTACT_RATE_LIMIT_WINDOW_SECONDS = 60 * 10;
export const CONTACT_RATE_LIMIT_TTL_SECONDS = 60 * 60;

type SendCommand = (command: object) => Promise<unknown>;
type MetricWriter = (message: string) => void;

export class ContactRateLimitError extends Error {
  constructor() {
    super('Too many contact requests. Please try again later.');
    this.name = 'ContactRateLimitError';
  }
}

export function isConditionalCheckFailed(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'name' in error && error.name === 'ConditionalCheckFailedException');
}

export async function enforceContactRateLimit({
  send,
  tableName,
  actorKey,
  nowSeconds,
  writeMetric = (message) => process.stdout.write(`${message}\n`),
}: {
  send: SendCommand;
  tableName: string;
  actorKey: string;
  nowSeconds: number;
  writeMetric?: MetricWriter;
}) {
  const windowStart = Math.floor(nowSeconds / CONTACT_RATE_LIMIT_WINDOW_SECONDS) * CONTACT_RATE_LIMIT_WINDOW_SECONDS;
  try {
    await send(new UpdateCommand({
      TableName: tableName,
      Key: { id: `RATE#${actorKey}#${windowStart}` },
      UpdateExpression: 'SET expiresAt = :expiresAt ADD requestCount :one',
      ConditionExpression: 'attribute_not_exists(requestCount) OR requestCount < :limit',
      ExpressionAttributeValues: {
        ':expiresAt': nowSeconds + CONTACT_RATE_LIMIT_TTL_SECONDS,
        ':one': 1,
        ':limit': CONTACT_RATE_LIMIT_MAX_REQUESTS,
      },
    }));
  } catch (error) {
    if (!isConditionalCheckFailed(error)) throw error;
    writeMetric(JSON.stringify({
      _aws: {
        Timestamp: nowSeconds * 1000,
        CloudWatchMetrics: [{
          Namespace: 'WantCove/ContactMessages',
          Dimensions: [[]],
          Metrics: [{ Name: 'RateLimitedRequests', Unit: 'Count' }],
        }],
      },
      RateLimitedRequests: 1,
    }));
    throw new ContactRateLimitError();
  }
}
