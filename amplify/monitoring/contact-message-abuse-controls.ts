import { Duration } from 'aws-cdk-lib';
import { Alarm, ComparisonOperator, Metric, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
import { CfnFunction, type IFunction } from 'aws-cdk-lib/aws-lambda';
import type { Construct } from 'constructs';

export const CONTACT_MESSAGES_RESERVED_CONCURRENCY = 5;

export function attachContactMessageAbuseControls(scope: Construct, contactMessagesLambda: IFunction) {
  const cfnFunction = contactMessagesLambda.node.defaultChild;
  if (!(cfnFunction instanceof CfnFunction)) throw new Error('Contact Lambda must expose its CloudFormation function resource.');
  cfnFunction.reservedConcurrentExecutions = CONTACT_MESSAGES_RESERVED_CONCURRENCY;

  const defaults = {
    evaluationPeriods: 1,
    threshold: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    treatMissingData: TreatMissingData.NOT_BREACHING,
  };
  const rateLimitAlarm = new Alarm(scope, 'ContactMessageRateLimitAlarm', {
    ...defaults,
    metric: new Metric({
      namespace: 'WantCove/ContactMessages',
      metricName: 'RateLimitedRequests',
      statistic: 'Sum',
      period: Duration.minutes(5),
    }),
  });
  const throttleAlarm = new Alarm(scope, 'ContactMessageThrottleAlarm', {
    ...defaults,
    metric: contactMessagesLambda.metricThrottles({ statistic: 'Sum', period: Duration.minutes(5) }),
  });
  return { rateLimitAlarm, throttleAlarm };
}
