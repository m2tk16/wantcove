import { defineFunction } from '@aws-amplify/backend';

export const contactMessagesFunction = defineFunction({
  name: 'contact-messages',
  entry: './handler.ts',
  resourceGroupName: 'data',
  timeoutSeconds: 10,
  logging: {
    format: 'text',
    retention: '1 month',
  },
});
