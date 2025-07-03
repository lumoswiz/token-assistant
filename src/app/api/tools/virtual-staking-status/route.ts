import { NextResponse } from 'next/server';
import { validateInput } from '@bitte-ai/agent-sdk';
import { getBitteToken, getVirtualStaking } from '../addresses';
import {
  getClient,
  VirtualStakeStatusInput,
  virtualStakeStatusParsers,
} from '../utils';
import { BITTE_VIRTUAL_TOKEN_ABI } from '../abi';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = validateInput<VirtualStakeStatusInput>(
      searchParams,
      virtualStakeStatusParsers
    );

    const { chainId } = input;
    const client = getClient(chainId);

    const balance = await client.readContract({
      address: getBitteToken(chainId),
      abi: BITTE_VIRTUAL_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [getVirtualStaking(chainId)],
    });

    const canVirtualStake = balance > 0n;

    return NextResponse.json({
      success: true,
      canVirtualStake,
      chainId,
    });
  } catch (err) {
    console.error('[VirtualStakeStatus Error]', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}
