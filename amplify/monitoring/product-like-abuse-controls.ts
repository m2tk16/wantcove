import { Duration } from 'aws-cdk-lib';
import {
  Alarm,
  ComparisonOperator,
  Metric,
  TreatMissingData,
} from 'aws-cdk-lib/aws-cloudwatch';
import { CfnFunction, type IFunction } from 'aws-cdk-lib/aws-lambda';
import type { Construct } from 'constructs';

export const PRODUCT_LIKES_RESERVED_CONCURRENCY = 10;

export function attachProductLikeAbuseControls(scope: Construct, productLikesLambda: IFunction) {
  const cfnFunction = productLikesLambda.node.defaultChild;
  if (!(cfnFunction instanceof CfnFunction)) {
    throw new Error('Product-like Lambda must expose its CloudFormation function resource.');
  }
  cfnFunction.reservedConcurrentExecutions = PRODUCT_LIKES_RESERVED_CONCURRENCY;

  const alarmDefaults = {
    evaluationPeriods: 1,
    threshold: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    treatMissingData: TreatMissingData.NOT_BREACHING,
  };

  const rateLimitAlarm = new Alarm(scope, 'ProductLikeRateLimitAlarm', {
    ...alarmDefaults,
    metric: new Metric({
      namespace: 'WantCove/ProductLikes',
      metricName: 'RateLimitedRequests',
      statistic: 'Sum',
      period: Duration.minutes(5),
    }),
  });

  const throttleAlarm = new Alarm(scope, 'ProductLikeThrottleAlarm', {
    ...alarmDefaults,
    metric: productLikesLambda.metricThrottles({
      statistic: 'Sum',
      period: Duration.minutes(5),
    }),
  });

  return { rateLimitAlarm, throttleAlarm };
}
