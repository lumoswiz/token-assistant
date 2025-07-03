// tools/claim/route.ts

import { NextResponse } from 'next/server';
import {
  validateInput,
  addressField,
  numberField,
  signRequestFor,
  type FieldParser,
} from '@bitte-ai/agent-sdk';
import { encodeFunctionData, getAddress } from 'viem';
import { fetchMerkleClaims } from '../utils';
import { BITTE_VIRTUAL_TOKEN_ABI } from '../abi';
import { getBitteVirtualToken } from '../addresses';

export interface ClaimInput {
  claimant: string;
  chainId: number;
  trancheId: number;
  index: number;
}

export const claimParsers: FieldParser<ClaimInput> = {
  claimant: addressField,
  chainId: numberField,
  trancheId: numberField,
  index: numberField,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = validateInput<ClaimInput>(searchParams, claimParsers);

    const claimant = getAddress(input.claimant);
    const allClaims = await fetchMerkleClaims();

    const target = allClaims.find(
      (c) =>
        c.trancheId === input.trancheId.toString() &&
        c.index === input.index &&
        c.claimant.toLowerCase() === claimant.toLowerCase()
    );
    if (!target) {
      return NextResponse.json(
        {
          error: `No claim found for tranche ${input.trancheId}, index ${input.index}`,
        },
        { status: 400 }
      );
    }
    const data = encodeFunctionData({
      abi: BITTE_VIRTUAL_TOKEN_ABI,
      functionName: 'claim',
      args: [
        BigInt(target.trancheId),
        BigInt(target.index),
        target.claimType,
        claimant,
        BigInt(target.claimableAmount),
        BigInt(target.claimableAmount),
        target.proof as `0x${string}`[],
      ],
    });

    const signRequest = signRequestFor({
      chainId: input.chainId,
      metaTransactions: [
        {
          to: getBitteVirtualToken(input.chainId),
          value: '0x0',
          data,
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        transaction: signRequest,
        meta: {
          trancheId: target.trancheId,
          index: target.index,
          amount: target.claimableAmount,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Claim Error]', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Error generating claim tx',
      },
      { status: 500 }
    );
  }
}
