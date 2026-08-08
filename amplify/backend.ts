import { defineBackend } from '@aws-amplify/backend';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { manageProductsFunction } from './functions/manage-products/resource';
import { publicCatalogFunction } from './functions/public-catalog/resource';
import { productLikesFunction } from './functions/product-likes/resource';
import { attachProductLikeAbuseControls } from './monitoring/product-like-abuse-controls';
import { attachAdminProductLikesPolicy } from './policies/admin-product-likes';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  manageProductsFunction,
  publicCatalogFunction,
  productLikesFunction,
});

// This user pool is an internal administration boundary. Public self-registration
// stays disabled until WantCove deliberately ships customer accounts.
backend.auth.resources.cfnResources.cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};

const productTable = backend.data.resources.tables['Product'];
const manageProductsLambda = backend.manageProductsFunction.resources.lambda;
const publicCatalogLambda = backend.publicCatalogFunction.resources.lambda;
const productLikesLambda = backend.productLikesFunction.resources.lambda;

attachProductLikeAbuseControls(backend.data.stack, productLikesLambda);

productTable.grantReadWriteData(manageProductsLambda);
productTable.grantReadData(publicCatalogLambda);
productTable.grantReadData(productLikesLambda);
backend.manageProductsFunction.addEnvironment('PRODUCT_TABLE_NAME', productTable.tableName);
backend.publicCatalogFunction.addEnvironment('PRODUCT_TABLE_NAME', productTable.tableName);
backend.productLikesFunction.addEnvironment('PRODUCT_TABLE_NAME', productTable.tableName);

const productLikesStack = backend.createStack('ProductLikes');
// Identity Pools honor the preferred IAM role emitted for a User Pool group.
// Keep this field-scoped policy in Data, which already owns the API and depends
// on Auth. ProductLikes supplies table values to Data and must not reference it.
attachAdminProductLikesPolicy(
  backend.data.stack,
  backend.data.resources.graphqlApi.arn,
  backend.auth.resources.groups['ADMINS'].role,
);

const productLikesTable = new Table(productLikesStack, 'ProductLikesTable', {
  partitionKey: { name: 'productSlug', type: AttributeType.STRING },
  sortKey: { name: 'actorKey', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  pointInTimeRecoverySpecification: {
    pointInTimeRecoveryEnabled: true,
  },
  timeToLiveAttribute: 'expiresAt',
});

productLikesTable.grantReadWriteData(productLikesLambda);
backend.productLikesFunction.addEnvironment('PRODUCT_LIKES_TABLE_NAME', productLikesTable.tableName);
