import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { describe, it } from 'vitest';
import { attachAdminContactSubmissionPolicy } from './admin-contact-submission';

describe('admin contact-submission policy', () => {
  it('grants only the identity-pool contact mutation field', () => {
    const stack = new Stack(new App(), 'AdminContactPolicyTest');
    const role = new Role(stack, 'AdminRole', { assumedBy: new ServicePrincipal('cognito-identity.amazonaws.com') });
    attachAdminContactSubmissionPolicy(stack, 'arn:aws:appsync:us-east-1:123456789012:apis/api-id', role);
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: { Statement: [{ Action: 'appsync:GraphQL', Effect: 'Allow', Resource: 'arn:aws:appsync:us-east-1:123456789012:apis/api-id/types/Mutation/fields/submitContactMessage' }] },
    });
  });
});
