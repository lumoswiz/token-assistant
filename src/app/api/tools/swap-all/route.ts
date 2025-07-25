import { NextResponse } from 'next/server';
import { validateInput, signRequestFor } from '@bitte-ai/agent-sdk';
import { encodeFunctionData, getAddress } from 'viem';
import { BITTE_VIRTUAL_TOKEN_ABI } from '../abi';
import { getBitteVirtualToken } from '../addresses';
import { SwapAllInput, swapAllParsers } from '../utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = validateInput<SwapAllInput>(searchParams, swapAllParsers);

    const claimant = getAddress(input.claimant);
    const tokenAddress = getBitteVirtualToken(input.chainId);

    const data = encodeFunctionData({
      abi: BITTE_VIRTUAL_TOKEN_ABI,
      functionName: 'swapAll',
    });

    const signRequest = signRequestFor({
      chainId: input.chainId,
      from: claimant,
      metaTransactions: [
        {
          to: tokenAddress,
          value: '0x0',
          data,
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        transaction: signRequest,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[SwapAll Error]', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Error generating swapAll tx',
      },
      { status: 500 }
    );
  }
}
