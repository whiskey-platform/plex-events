import * as sns from 'aws-cdk-lib/aws-sns';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { StackContext, Topic } from 'sst/constructs';

export const ExistingResources = ({ stack }: StackContext) => {
  const arnLookup = StringParameter.valueFromLookup(
    stack,
    `/sst/push-notifications/${stack.stage}/Topic/NotificationsTopic/topicArn`
  );
  let arnLookupValue: string;
  if (arnLookup.includes('dummy-value')) {
    arnLookupValue = stack.formatArn({
      service: 'sns',
      resource: 'topic',
      resourceName: arnLookup,
    });
  } else {
    arnLookupValue = arnLookup;
  }
  const notificationsTopic = new Topic(stack, 'NotificationsTopic', {
    cdk: {
      topic: sns.Topic.fromTopicArn(stack, 'ExistingNotificationsTopic', arnLookupValue),
    },
  });

  return { notificationsTopic };
};
