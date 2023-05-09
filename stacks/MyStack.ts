import { StackContext, Api, Table, ApiDomainProps, use } from 'sst/constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { DomainName } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Tags } from 'aws-cdk-lib';
import { ExistingResources } from './ExistingResources';

export function API({ stack, app }: StackContext) {
  const { notificationsTopic } = use(ExistingResources);
  const receivedWebhooksTable = new Table(stack, 'ReceivedWebhooksTable', {
    fields: {
      event: 'string',
      timestamp: 'number',
    },
    primaryIndex: {
      partitionKey: 'event',
      sortKey: 'timestamp',
    },
    consumers: {
      tableChangedHandler: 'packages/functions/src/table-consumers/table-changed-handler.handler',
    },
    stream: true,
  });
  receivedWebhooksTable.bind([notificationsTopic]);

  let customDomain: ApiDomainProps | undefined;
  if (!app.local && app.stage !== 'local') {
    customDomain = {
      path: 'plex-events',
      cdk: {
        domainName: DomainName.fromDomainNameAttributes(stack, 'ApiDomain', {
          name: StringParameter.valueFromLookup(
            stack,
            `/sst-outputs/${app.stage}-api-infra-Infra/domainName`
          ),
          regionalDomainName: StringParameter.valueFromLookup(
            stack,
            `/sst-outputs/${app.stage}-api-infra-Infra/regionalDomainName`
          ),
          regionalHostedZoneId: StringParameter.valueFromLookup(
            stack,
            `/sst-outputs/${app.stage}-api-infra-Infra/regionalHostedZoneId`
          ),
        }),
      },
    };
  }

  const api = new Api(stack, 'api', {
    routes: {
      'POST /webhook': 'packages/functions/src/webhooks/function.handler',
    },
    customDomain,
  });
  api.bind([receivedWebhooksTable]);

  stack.getAllFunctions().forEach(fn => Tags.of(fn).add('lumigo:auto-trace', 'true'));
}
