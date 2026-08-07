import { defineBackend } from '@aws-amplify/backend';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
});

const productLikesStack = backend.createStack('ProductLikes');
const productLikesTable = new Table(productLikesStack, 'ProductLikesTable', {
  partitionKey: { name: 'productSlug', type: AttributeType.STRING },
  sortKey: { name: 'actorKey', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  pointInTimeRecovery: true,
  timeToLiveAttribute: 'expiresAt',
});

backend.data.addDynamoDbDataSource('ProductLikesTableDataSource', productLikesTable);
