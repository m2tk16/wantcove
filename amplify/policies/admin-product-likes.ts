import type { Construct } from 'constructs';
import { Policy, PolicyStatement, type IRole } from 'aws-cdk-lib/aws-iam';

export function attachAdminProductLikesPolicy(
  scope: Construct,
  graphqlApiArn: string,
  adminRole: IRole,
) {
  const policy = new Policy(scope, 'AdminProductLikesPolicy', {
    statements: [new PolicyStatement({
      actions: ['appsync:GraphQL'],
      resources: [
        `${graphqlApiArn}/types/Query/fields/getViewerProductLike`,
        `${graphqlApiArn}/types/Mutation/fields/setViewerProductLike`,
      ],
    })],
  });

  policy.attachToRole(adminRole);
  return policy;
}
