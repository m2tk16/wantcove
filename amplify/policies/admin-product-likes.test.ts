import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { describe, expect, it } from 'vitest';
import { attachAdminProductLikesPolicy } from './admin-product-likes';

describe('admin product-like IAM policy', () => {
  it('grants the preferred ADMINS role only the two identity-scoped like fields', () => {
    const stack = new Stack(new App(), 'TestStack');
    const role = new Role(stack, 'AdminRole', {
      assumedBy: new ServicePrincipal('cognito-identity.amazonaws.com'),
    });
    const apiArn = 'arn:aws:appsync:us-east-1:123456789012:apis/test-api';

    attachAdminProductLikesPolicy(stack, apiArn, role);

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::IAM::Policy', 1);
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [{
          Action: 'appsync:GraphQL',
          Effect: 'Allow',
          Resource: [
            `${apiArn}/types/Query/fields/getViewerProductLike`,
            `${apiArn}/types/Mutation/fields/setViewerProductLike`,
          ],
        }],
      },
      Roles: Match.arrayWith([{ Ref: Match.stringLikeRegexp('AdminRole') }]),
    });

    const policies = template.findResources('AWS::IAM::Policy');
    const statements = Object.values(policies)[0].Properties.PolicyDocument.Statement;
    expect(JSON.stringify(statements)).not.toContain('*');
    expect(JSON.stringify(statements)).not.toContain('manageProduct');
  });
});
