import { defineFunction } from '@aws-amplify/backend';

export const publicCatalogFunction = defineFunction({
  name: 'public-catalog',
  entry: './handler.ts',
  timeoutSeconds: 10,
});
