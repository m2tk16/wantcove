import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { describe, it } from 'vitest';
import {
  attachProductLikeAbuseControls,
  PRODUCT_LIKES_RESERVED_CONCURRENCY,
} from './product-like-abuse-controls';

describe('product-like infrastructure abuse controls', () => {
  it('caps concurrency and alarms on any rate-limit or throttle event', () => {
    const stack = new Stack(new App(), 'TestStack');
    const lambda = new Function(stack, 'ProductLikesFunction', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: Code.fromInline('exports.handler = async () => true'),
    });

    attachProductLikeAbuseControls(stack, lambda);

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Lambda::Function', {
      ReservedConcurrentExecutions: PRODUCT_LIKES_RESERVED_CONCURRENCY,
    });
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      Namespace: 'WantCove/ProductLikes',
      MetricName: 'RateLimitedRequests',
      Statistic: 'Sum',
      Period: 300,
      Threshold: 1,
      EvaluationPeriods: 1,
      TreatMissingData: 'notBreaching',
    });
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      Namespace: 'AWS/Lambda',
      MetricName: 'Throttles',
      Statistic: 'Sum',
      Period: 300,
      Threshold: 1,
      EvaluationPeriods: 1,
      TreatMissingData: 'notBreaching',
    });
  });
});
