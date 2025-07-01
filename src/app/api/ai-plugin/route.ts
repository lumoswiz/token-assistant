import { ACCOUNT_ID, PLUGIN_URL } from '@/app/config';
import { NextResponse } from 'next/server';

export async function GET() {
  const pluginData = {
    openapi: '3.0.0',
    info: {
      title: 'Bitte Token Agent',
      description:
        'API exposing state queries and transaction payloads for user actions related to the Bitte Token',
      version: '1.0.0',
    },
    servers: [
      {
        url: PLUGIN_URL,
      },
    ],
    'x-mb': {
      'account-id': ACCOUNT_ID,
      assistant: {
        name: 'Bitte Token Agent',
        description:
          'An agent facilitating user actions and queries for the Bitte Token',
        instructions: '',
        tools: [],
        categories: ['token'],
        chainIds: [
          8453, // Base mainnet
          84532, // Base sepolia
        ],
      },
    },
    paths: {},
  };

  return NextResponse.json(pluginData);
}
