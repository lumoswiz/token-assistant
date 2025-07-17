import { NextResponse } from 'next/server';
import { ACCOUNT_ID, PLUGIN_URL } from '@/app/config';
import {
  addressParam,
  AddressSchema,
  amountParam,
  chainIdParam,
  MetaTransactionSchema,
  SignRequestResponse200,
  SignRequestSchema,
} from '@bitte-ai/agent-sdk';
import {
  SummaryResponse200,
  BalanceResponse200,
  VirtualStakingStatusResponse200,
  GetAgentsResponse200,
} from './components/responses';
import { instructions } from './instructions';
import { numberArrayStringParam, numberParam } from './params';

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
      '/api/tools/claim-many': {
        get: {
          summary: 'get claimMany transaction payloads',
          description:
            'Responds with a Bitte Virtual Token claimMany transaction payload',
          operationId: 'claimMany',
          parameters: [
            { $ref: '#/components/parameters/claimant' },
            { $ref: '#/components/parameters/chainId' },
            { $ref: '#/components/parameters/trancheIds' },
            { $ref: '#/components/parameters/indices' },
          ],
          responses: {
            '200': { $ref: '#/components/responses/SignRequestResponse200' },
          },
        },
      },
      '/api/tools/balance': {
        get: {
          summary: 'summarise user virtual token balances',
          description:
            'Responds with a summary of the virtual token balances of the user',
          operationId: 'balance',
          parameters: [
            { $ref: '#/components/parameters/claimant' },
            { $ref: '#/components/parameters/chainId' },
          ],
          responses: {
            '200': { $ref: '#/components/responses/BalanceResponse200' },
          },
        },
      },
      '/api/tools/delegate': {
        get: {
          summary: 'get delegate stake transaction payloads',
          description:
            'Responds with a Bitte Virtual Token delegate stake transaction payload',
          operationId: 'delegate',
          parameters: [
            { $ref: '#/components/parameters/claimant' },
            { $ref: '#/components/parameters/chainId' },
            { $ref: '#/components/parameters/agent' },
            { $ref: '#/components/parameters/amount' },
          ],
          responses: {
            '200': { $ref: '#/components/responses/SignRequestResponse200' },
          },
        },
      },
      '/api/tools/stake': {
        get: {
          summary: 'get agent stake transaction payloads',
          description:
            'Responds with a Bitte Virtual Token stake (agent) transaction payload',
          operationId: 'stake',
          parameters: [
            { $ref: '#/components/parameters/claimant' },
            { $ref: '#/components/parameters/chainId' },
            { $ref: '#/components/parameters/agent' },
            { $ref: '#/components/parameters/amount' },
          ],
          responses: {
            '200': { $ref: '#/components/responses/SignRequestResponse200' },
          },
        },
      },
      '/api/tools/swap-all': {
        get: {
          summary: 'get swapAll transaction payloads',
          description:
            'Responds with a Bitte Virtual Token swapAll transaction payload',
          operationId: 'swap-all',
          parameters: [
            { $ref: '#/components/parameters/claimant' },
            { $ref: '#/components/parameters/chainId' },
          ],
          responses: {
            '200': { $ref: '#/components/responses/SignRequestResponse200' },
          },
        },
      },
      '/api/tools/virtual-staking-status': {
        get: {
          summary: 'get virtual staking status ',
          description: 'Responds with if virtual staking is enabled',
          operationId: 'virtual-staking-status',
          parameters: [{ $ref: '#/components/parameters/chainId' }],
          responses: {
            '200': {
              $ref: '#/components/responses/VirtualStakingStatusResponse200',
            },
          },
        },
      },
      '/api/tools/get-agents': {
        get: {
          summary: 'get agents ',
          description: 'Responds with agent contract addresses to stake to',
          operationId: 'get-agents',
          parameters: [{ $ref: '#/components/parameters/chainId' }],
          responses: {
            '200': { $ref: '#/components/responses/GetAgentsResponse200' },
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
        trancheIds: {
          ...numberArrayStringParam,
          name: 'trancheIds',
          description: 'Comma-separated list of tranche identifiers',
        },
        indices: {
          ...numberArrayStringParam,
          name: 'indices',
          description: 'Comma-separated list of indices within each tranche',
        },
        amount: amountParam,
        agent: { ...addressParam, name: 'agent' },
      },
      schemas: {
        Address: AddressSchema,
        SignRequest: SignRequestSchema,
        MetaTransaction: MetaTransactionSchema,
      },
      responses: {
        SummaryResponse200,
        SignRequestResponse200,
        BalanceResponse200,
        VirtualStakingStatusResponse200,
        GetAgentsResponse200,
      },
    },
  };

  return NextResponse.json(pluginData);
}
