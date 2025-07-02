import { NextResponse } from 'next/server';
import {
  validateInput,
  addressField,
  numberField,
  type FieldParser,
} from '@bitte-ai/agent-sdk';
import { getAddress } from 'viem';
import { getClient, getBitteVirtualToken } from '../utils';
import { BITTE_VIRTUAL_TOKEN_ABI } from '../abi';

export interface BalanceInput {
  claimant: string;
  chainId: number;
}

export const balanceParsers: FieldParser<BalanceInput> = {
  claimant: addressField,
  chainId: numberField,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = validateInput<BalanceInput>(searchParams, balanceParsers);

    const claimantAddress = getAddress(input.claimant);
    const client = getClient(input.chainId);
    const tokenAddress = getBitteVirtualToken(input.chainId);

    const calls = [
      {
        address: tokenAddress,
        abi: BITTE_VIRTUAL_TOKEN_ABI,
        functionName: 'balanceOf' as const,
        args: [claimantAddress],
      },
      {
        address: tokenAddress,
        abi: BITTE_VIRTUAL_TOKEN_ABI,
        functionName: 'swappableBalanceOf' as const,
        args: [claimantAddress],
      },
    ];

    const results = await client.multicall({ contracts: calls });

    const [balanceOfResult, swappableBalanceOfResult] = results;

    if (
      balanceOfResult.status !== 'success' ||
      swappableBalanceOfResult.status !== 'success'
    ) {
      return NextResponse.json(
        { error: 'Failed to fetch balances' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          balanceOf: balanceOfResult.result.toString(),
          swappableBalanceOf: swappableBalanceOfResult.result.toString(),
          chainId: input.chainId,
          claimant: claimantAddress,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Balance Error]', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error fetching balances',
      },
      { status: 400 }
    );
  }
}
