import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

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
  return ddb.get({ key: getKey(ctx), consistentRead: true });
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  return Boolean(
    ctx.result?.expiresAt &&
      ctx.result.expiresAt > util.time.nowEpochSeconds(),
  );
}
