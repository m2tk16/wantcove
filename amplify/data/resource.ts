import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Collection: a
    .model({
      title: a.string().required(),
      description: a.string(),
      owner: a
        .string()
        .authorization((allow) => [allow.owner().to(['read', 'delete'])]),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
