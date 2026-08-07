import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

const PRODUCT_LIKE_TTL_SECONDS = 60 * 60 * 24 * 180;
const productSlugs = [
  'levitating-globe-lamp',
  'adjustable-dumbbell-set',
  'portable-pizza-oven',
  'wireless-earbuds',
];

function getKey(ctx) {
  const productSlug = ctx.args.productSlug;
  const actorKey = ctx.identity?.cognitoIdentityId;

  if (!actorKey) {
    util.unauthorized();
  }

  if (productSlugs.indexOf(productSlug) === -1) {
    util.error('Unknown product.', 'BadRequest');
  }

  return { productSlug, actorKey };
}

export function request(ctx) {
  const key = getKey(ctx);

  if (!ctx.args.liked) {
    return ddb.remove({ key });
  }

  return ddb.put({
    key,
    item: {
      ...key,
      expiresAt: util.time.nowEpochSeconds() + PRODUCT_LIKE_TTL_SECONDS,
    },
  });
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  return ctx.args.liked;
}
