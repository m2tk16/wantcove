import type { Construct } from 'constructs';
import { Policy, PolicyStatement, type IRole } from 'aws-cdk-lib/aws-iam';

export function attachAdminContactSubmissionPolicy(scope: Construct, graphqlApiArn: string, adminRole: IRole) {
  const policy = new Policy(scope, 'AdminContactSubmissionPolicy', {
    statements: [new PolicyStatement({
      actions: ['appsync:GraphQL'],
      resources: [`${graphqlApiArn}/types/Mutation/fields/submitContactMessage`],
    })],
  });
  policy.attachToRole(adminRole);
  return policy;
}
