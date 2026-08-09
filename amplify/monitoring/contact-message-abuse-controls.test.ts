import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { describe, it } from 'vitest';
import { attachContactMessageAbuseControls, CONTACT_MESSAGES_RESERVED_CONCURRENCY } from './contact-message-abuse-controls';

describe('contact-message infrastructure abuse controls', () => {
  it('caps concurrency and alarms on rate-limit and throttle events', () => {
    const stack = new Stack(new App(), 'ContactTestStack');
    const lambda = new Function(stack, 'ContactMessagesFunction', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: Code.fromInline('exports.handler = async () => true'),
    });
    attachContactMessageAbuseControls(stack, lambda);
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Lambda::Function', { ReservedConcurrentExecutions: CONTACT_MESSAGES_RESERVED_CONCURRENCY });
    template.hasResourceProperties('AWS::CloudWatch::Alarm', { Namespace: 'WantCove/ContactMessages', MetricName: 'RateLimitedRequests', Threshold: 1 });
    template.hasResourceProperties('AWS::CloudWatch::Alarm', { Namespace: 'AWS/Lambda', MetricName: 'Throttles', Threshold: 1 });
  });
});
