import { NextResponse } from 'next/server';
import { ACCOUNT_ID, PLUGIN_URL } from '@/app/config';
import { addressParam, AddressSchema, chainIdParam } from '@bitte-ai/agent-sdk';
import { SummaryResponse200 } from './components/responses';
import { instructions } from './instructions';

export async function GET() {
  const pluginData = {
    openapi: '3.0.0',
    info: {
      title: 'Bitte Token Agent',
      description:
        'API exposing state queries and transaction payloads for user actions related to the Bitte Token',
      version: '1.0.0',
    },
    servers: [{ url: PLUGIN_URL }],
    'x-mb': {
      'account-id': ACCOUNT_ID,
      assistant: {
        name: 'Bitte Token Agent',
        description:
          'An agent facilitating user actions and queries for the Bitte Token',
        instructions: instructions,
        tools: [{ type: 'generate-evm-tx' }],
        categories: ['token'],
        chainIds: [8453, 84532],
      },
    },
    paths: {
      '/api/tools/summary': {
        get: {
          summary: 'summarise user claim data',
          description:
            'Responds with a tabular summary of the claim data for the user',
          operationId: 'summary',
          parameters: [
            { $ref: '#/components/parameters/claimant' },
            { $ref: '#/components/parameters/chainId' },
          ],
          responses: {
            '200': { $ref: '#/components/responses/SummaryResponse200' },
          },
        },
      },
    },
    components: {
      parameters: {
        claimant: { ...addressParam, name: 'claimant' },
        chainId: chainIdParam,
      },
      schemas: { Address: AddressSchema },
      responses: { SummaryResponse200 },
    },
  };

  return NextResponse.json(pluginData);
}
