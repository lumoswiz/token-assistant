import { NextResponse } from 'next/server';
import { validateInput } from '@bitte-ai/agent-sdk';
import { getAddress } from 'viem';
import { getProcessedSummary, SummaryInput, summaryParsers } from '../utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = validateInput<SummaryInput>(searchParams, summaryParsers);

    const { claims, meta } = await getProcessedSummary(
      getAddress(input.claimant),
      input.chainId
    );

    return NextResponse.json(
      {
        success: true,
        claims,
        meta: {
          ...meta,
          chainId: input.chainId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Summary Error]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Validation failed',
      },
      { status: 400 }
    );
  }
}
