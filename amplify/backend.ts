import { defineBackend } from '@aws-amplify/backend';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { productLikesFunction } from './functions/product-likes/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  productLikesFunction,
});

const productLikesStack = backend.createStack('ProductLikes');
const productLikesTable = new Table(productLikesStack, 'ProductLikesTable', {
  partitionKey: { name: 'productSlug', type: AttributeType.STRING },
  sortKey: { name: 'actorKey', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  pointInTimeRecovery: true,
  timeToLiveAttribute: 'expiresAt',
});

const productLikesLambda = backend.productLikesFunction.resources.lambda;
productLikesTable.grantReadWriteData(productLikesLambda);
backend.productLikesFunction.addEnvironment('PRODUCT_LIKES_TABLE_NAME', productLikesTable.tableName);
