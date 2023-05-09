import { DynamoDBService } from '@whiskeylerts-ingest/core';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { Table } from 'sst/node/table';

const dynamo = DynamoDBService.live();
export const handler: APIGatewayProxyHandlerV2 = async event => {
  const body = JSON.parse(event.body!);

  const toSave = {
    ...body,
    timestamp: event.requestContext.timeEpoch,
  };
  await dynamo.save(toSave, Table.ReceivedWebhooksTable.tableName);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success!' }),
  };
};
