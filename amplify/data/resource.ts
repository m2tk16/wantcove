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
  getViewerProductLike: a
    .query()
    .arguments({ productSlug: a.string().required() })
    .returns(a.boolean().required())
    .authorization((allow) => [
      allow.guest(),
      allow.authenticated('identityPool'),
    ])
    .handler(
      a.handler.custom({
        dataSource: 'ProductLikesTableDataSource',
        entry: './get-viewer-product-like.js',
      }),
    ),
  setViewerProductLike: a
    .mutation()
    .arguments({
      productSlug: a.string().required(),
      liked: a.boolean().required(),
    })
    .returns(a.boolean().required())
    .authorization((allow) => [
      allow.guest(),
      allow.authenticated('identityPool'),
    ])
    .handler(
      a.handler.custom({
        dataSource: 'ProductLikesTableDataSource',
        entry: './set-viewer-product-like.js',
      }),
    ),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
