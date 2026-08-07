import { defineFunction } from '@aws-amplify/backend';

export const productLikesFunction = defineFunction({
  name: 'product-likes',
  entry: './handler.ts',
  timeoutSeconds: 10,
});
