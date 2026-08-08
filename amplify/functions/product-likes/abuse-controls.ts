import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

export const PRODUCT_LIKE_RATE_LIMIT_MAX_REQUESTS = 60;
export const PRODUCT_LIKE_RATE_LIMIT_WINDOW_SECONDS = 60;
export const PRODUCT_LIKE_RATE_LIMIT_TTL_SECONDS = 60 * 10;

type SendCommand = (command: object) => Promise<unknown>;
type MetricWriter = (message: string) => void;

export class ProductLikeRateLimitError extends Error {
  constructor() {
    super('Too many like requests. Please try again shortly.');
    this.name = 'ProductLikeRateLimitError';
  }
}

export function isConditionalCheckFailed(error: unknown) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ConditionalCheckFailedException',
  );
}

function writeRateLimitMetric(nowSeconds: number, write: MetricWriter) {
  write(JSON.stringify({
    _aws: {
      Timestamp: nowSeconds * 1000,
      CloudWatchMetrics: [{
        Namespace: 'WantCove/ProductLikes',
        Dimensions: [[]],
        Metrics: [{ Name: 'RateLimitedRequests', Unit: 'Count' }],
      }],
    },
    RateLimitedRequests: 1,
  }));
}

export async function enforceProductLikeRateLimit({
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
  const windowStart = Math.floor(nowSeconds / PRODUCT_LIKE_RATE_LIMIT_WINDOW_SECONDS) * PRODUCT_LIKE_RATE_LIMIT_WINDOW_SECONDS;

  try {
    await send(new UpdateCommand({
      TableName: tableName,
      Key: {
        productSlug: `__rate_limit__#${actorKey}`,
        actorKey: `window#${windowStart}`,
      },
      UpdateExpression: 'SET expiresAt = :expiresAt ADD requestCount :one',
      ConditionExpression: 'attribute_not_exists(requestCount) OR requestCount < :limit',
      ExpressionAttributeValues: {
        ':expiresAt': nowSeconds + PRODUCT_LIKE_RATE_LIMIT_TTL_SECONDS,
        ':one': 1,
        ':limit': PRODUCT_LIKE_RATE_LIMIT_MAX_REQUESTS,
      },
    }));
  } catch (error) {
    if (!isConditionalCheckFailed(error)) throw error;
    writeRateLimitMetric(nowSeconds, writeMetric);
    throw new ProductLikeRateLimitError();
  }
}
