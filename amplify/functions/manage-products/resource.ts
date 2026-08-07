import { defineFunction } from '@aws-amplify/backend';

export const manageProductsFunction = defineFunction({
  name: 'manage-products',
  entry: './handler.ts',
  timeoutSeconds: 10,
});
