import { defineFunction } from '@aws-amplify/backend';

export const productLikesFunction = defineFunction({
  name: 'product-likes',
  entry: './handler.ts',
  resourceGroupName: 'data',
  timeoutSeconds: 10,
});
