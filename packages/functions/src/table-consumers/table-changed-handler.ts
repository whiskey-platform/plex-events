import { SNSService } from '@whiskeylerts-ingest/core';
import { NativeAttributeValue, unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDBStreamHandler } from 'aws-lambda';
import { Topic } from 'sst/node/topic';

const sns = SNSService.live();
export const handler: DynamoDBStreamHandler = async event => {
  for (const record of event.Records) {
    if (record.eventName === 'INSERT') {
      const unmarshalled = unmarshall(
        record.dynamodb!.NewImage! as unknown as Record<string, NativeAttributeValue>
      );
      await sns.publishEvent(unmarshalled, Topic.NotificationsTopic.topicArn);
    }
  }
};
