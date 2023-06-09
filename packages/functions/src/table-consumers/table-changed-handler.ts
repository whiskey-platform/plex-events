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
      if (unmarshalled.event === 'library.new') {
        let body = unmarshalled.Metadata.title; // films
        if (unmarshalled.Metadata.type === 'episode') {
          body = `${unmarshalled.Metadata.grandparentTitle} - s${unmarshalled.Metadata.parentIndex}e${unmarshalled.Metadata.index} - ${unmarshalled.Metadata.title}`;
        } else if (unmarshalled.Metadata.type === 'movie') {
          body = `${unmarshalled.Metadata.title} (${unmarshalled.Metadata.year})`;
        }
        await sns.publishEvent(
          {
            body: {
              aps: {
                alert: {
                  title: 'WhiskeyFlix',
                  subtitle: 'New Content Available',
                  body,
                },
              },
              channel: 'plex',
              externalLink: `plex://preplay/?metadataKey=${encodeURIComponent(
                unmarshalled.Metadata.key
              )}&metadataType=1&server=${unmarshalled.Server.uuid}`,
            },
            plex: unmarshalled,
          },
          Topic.NotificationsTopic.topicArn
        );
      }
    }
  }
};
