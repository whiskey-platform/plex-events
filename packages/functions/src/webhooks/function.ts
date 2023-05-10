import middy from '@middy/core';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import multipartBodyParser from '@middy/http-multipart-body-parser';
import { DynamoDBService } from '@whiskeylerts-ingest/core';
import { APIGatewayProxyHandler, APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { Table } from 'sst/node/table';

const dynamo = DynamoDBService.live();
const webhook: APIGatewayProxyHandler = async event => {
  console.log(event.body);
  const body = event.body! as unknown as any;

  const toSave = {
    ...JSON.parse(body.payload),
    timestamp: event.requestContext.requestTimeEpoch,
  };
  await dynamo.save(toSave, Table.ReceivedWebhooksTable.tableName);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success!' }),
  };
};

export const handler = middy(webhook).use(httpHeaderNormalizer()).use(multipartBodyParser());
