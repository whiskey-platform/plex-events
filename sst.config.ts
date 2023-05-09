import { SSTConfig } from 'sst';
import { API } from './stacks/MyStack';
import { ExistingResources } from './stacks/ExistingResources';

export default {
  config(_input) {
    return {
      name: 'whiskeyflix-events',
      region: 'us-east-1',
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: 'nodejs18.x',
      nodejs: {
        esbuild: {
          external: !app.local ? ['@aws-sdk/*'] : undefined,
        },
      },
    });
    app.stack(ExistingResources).stack(API);
  },
} satisfies SSTConfig;
