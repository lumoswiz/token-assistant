import { NextResponse } from 'next/server';
import { validateInput } from '@bitte-ai/agent-sdk';
import { getAgentsStatusParsers, GetAgentsStatusInput } from '../utils';
import { GraphQLClient, gql } from 'graphql-request';

const INDEXER_URL = 'https://indexer.dev.hyperindex.xyz/0569c03/v1/graphql';
const AGENT_QUERY = gql`
  query GetAgents {
    AgentStaking_AgentSet {
      agent
    }
  }
`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const input = validateInput<GetAgentsStatusInput>(
      searchParams,
      getAgentsStatusParsers
    );
    const { chainId } = input;

    const client = new GraphQLClient(INDEXER_URL);
    const data = await client.request<{
      AgentStaking_AgentSet: { agent: string }[];
    }>(AGENT_QUERY);

    const agents = data.AgentStaking_AgentSet.map((e) => e.agent);

    return NextResponse.json({
      success: true,
      chainId,
      agents,
    });
  } catch (err) {
    console.error('[GetAgents Error]', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}
