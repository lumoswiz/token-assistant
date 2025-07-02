import { NextResponse } from 'next/server';
import { ACCOUNT_ID, PLUGIN_URL } from '@/app/config';
import {
  addressParam,
  AddressSchema,
  chainIdParam,
  MetaTransactionSchema,
  SignRequestResponse200,
  SignRequestSchema,
} from '@bitte-ai/agent-sdk';
import { SummaryResponse200 } from './components/responses';
import { instructions } from './instructions';
import { numberParam } from './params';

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
      '/api/tools/claim': {
        get: {
          summary: 'get claim transaction payloads',
          description:
            'Responds with a Bitte Virtual Token claim transaction payload',
          operationId: 'claim',
          parameters: [
            { $ref: '#/components/parameters/claimant' },
            { $ref: '#/components/parameters/chainId' },
            { $ref: '#/components/parameters/trancheId' },
            { $ref: '#/components/parameters/index' },
          ],
          responses: {
            '200': { $ref: '#/components/responses/SignRequestResponse200' },
          },
        },
      },
    },
    components: {
      parameters: {
        claimant: { ...addressParam, name: 'claimant' },
        chainId: chainIdParam,
        trancheId: {
          ...numberParam,
          name: 'trancheId',
          description: 'Tranche identifier',
          example: 0,
        },
        index: {
          ...numberParam,
          name: 'index',
          description: 'Position within the tranche',
          example: 7,
        },
      },
      schemas: {
        Address: AddressSchema,
        SignRequest: SignRequestSchema,
        MetaTransaction: MetaTransactionSchema,
      },
      responses: { SummaryResponse200, SignRequestResponse200 },
    },
  };

  return NextResponse.json(pluginData);
}
