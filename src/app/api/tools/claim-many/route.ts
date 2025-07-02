import { NextResponse } from 'next/server';
import {
  validateInput,
  addressField,
  numberField,
  signRequestFor,
  type FieldParser,
} from '@bitte-ai/agent-sdk';
import { encodeFunctionData, getAddress } from 'viem';
import { fetchMerkleClaims, getBitteVirtualToken } from '../utils';
import { BITTE_VIRTUAL_TOKEN_ABI } from '../abi';

export interface ClaimManyInput {
  claimant: string;
  chainId: number;
  trancheIds: number[];
  indices: number[];
}

const numericArrayField = (param: string | null, name: string): number[] => {
  if (!param) {
    throw new Error(`Missing required parameter: ${name}`);
  }
  return param.split(',').map((x) => {
    const num = Number(x.trim());
    if (isNaN(num)) {
      throw new Error(`Invalid number '${x}' in parameter '${name}'`);
    }
    return num;
  });
};

export const claimManyParsers: FieldParser<ClaimManyInput> = {
  claimant: addressField,
  chainId: numberField,
  trancheIds: numericArrayField,
  indices: numericArrayField,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = validateInput<ClaimManyInput>(searchParams, claimManyParsers);

    if (
      input.trancheIds.length !== input.indices.length ||
      input.trancheIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'trancheIds and indices arrays must match in length and not be empty',
        },
        { status: 400 }
      );
    }

    const claimantAddress = getAddress(input.claimant);
    const allClaims = await fetchMerkleClaims();

    const targets = [];

    for (let idx = 0; idx < input.trancheIds.length; idx++) {
      const trancheId = input.trancheIds[idx];
      const claim = allClaims.find(
        (c) =>
          c.trancheId === trancheId.toString() &&
          c.index === input.indices[idx] &&
          c.claimant.toLowerCase() === claimantAddress.toLowerCase()
      );

      if (!claim) {
        return NextResponse.json(
          {
            error: `No claim found for trancheId=${trancheId}, index=${input.indices[idx]}`,
          },
          { status: 400 }
        );
      }

      targets.push(claim);
    }

    const data = encodeFunctionData({
      abi: BITTE_VIRTUAL_TOKEN_ABI,
      functionName: 'claimMany',
      args: [
        targets.map((c) => BigInt(c.trancheId)),
        targets.map((c) => BigInt(c.index)),
        targets.map((c) => c.claimType),
        targets.map(() => claimantAddress),
        targets.map((c) => BigInt(c.claimableAmount)),
        targets.map((c) => BigInt(c.claimableAmount)),
        targets.map((c) => c.proof as `0x${string}`[]),
        targets.map(() => BigInt(0)),
      ],
    });

    const transaction = signRequestFor({
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
        transaction,
        meta: targets.map((target) => ({
          trancheId: target.trancheId,
          index: target.index,
          amount: target.claimableAmount,
        })),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[ClaimMany Error]', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Error generating claim-many tx',
      },
      { status: 500 }
    );
  }
}
