import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { manageProductsFunction } from '../functions/manage-products/resource';
import { publicCatalogFunction } from '../functions/public-catalog/resource';
import { productLikesFunction } from '../functions/product-likes/resource';

const schema = a.schema({
  ProductStatus: a.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  ProductAction: a.enum(['CREATE', 'UPDATE', 'PUBLISH', 'ARCHIVE', 'DELETE']),
  Product: a
    .model({
      slug: a.string().required(),
      name: a.string().required(),
      description: a.string().required(),
      category: a.string().required(),
      imageUrl: a.string().required(),
      imageAlt: a.string().required(),
      priceLabel: a.string(),
      ratingLabel: a.string(),
      amazonAsin: a.string(),
      retailerUrl: a.url(),
      status: a.ref('ProductStatus').required(),
      featuredRank: a.integer(),
      publishedAt: a.datetime(),
    })
    .identifier(['slug'])
    .authorization((allow) => [allow.group('ADMINS').to(['read'])]),
  Collection: a
    .model({
      title: a.string().required(),
      description: a.string(),
      owner: a
        .string()
        .authorization((allow) => [allow.owner().to(['read', 'delete'])]),
    })
    .authorization((allow) => [allow.owner()]),
  listPublishedProducts: a
    .query()
    .returns(a.json().required())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(publicCatalogFunction)),
  getPublishedProduct: a
    .query()
    .arguments({ slug: a.string().required() })
    .returns(a.json())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function(publicCatalogFunction)),
  manageProduct: a
    .mutation()
    .arguments({
      action: a.ref('ProductAction').required(),
      slug: a.string().required(),
      name: a.string(),
      description: a.string(),
      category: a.string(),
      imageUrl: a.string(),
      imageAlt: a.string(),
      priceLabel: a.string(),
      ratingLabel: a.string(),
      amazonAsin: a.string(),
      retailerUrl: a.url(),
      featuredRank: a.integer(),
    })
    .returns(a.json().required())
    .authorization((allow) => [allow.group('ADMINS')])
    .handler(a.handler.function(manageProductsFunction)),
  migrateStarterProducts: a
    .mutation()
    .returns(a.json().required())
    .authorization((allow) => [allow.group('ADMINS')])
    .handler(a.handler.function(manageProductsFunction)),
  getViewerProductLike: a
    .query()
    .arguments({ productSlug: a.string().required() })
    .returns(a.boolean().required())
    .authorization((allow) => [
      allow.guest(),
      allow.authenticated('identityPool'),
    ])
    .handler(a.handler.function(productLikesFunction)),
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
    .handler(a.handler.function(productLikesFunction)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});
