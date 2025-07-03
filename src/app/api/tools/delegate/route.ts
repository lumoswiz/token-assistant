import { NextResponse } from 'next/server';
import {
  validateInput,
  addressField,
  numberField,
  floatField,
  signRequestFor,
  type FieldParser,
} from '@bitte-ai/agent-sdk';
import { encodeFunctionData, getAddress, parseEther } from 'viem';
import { getClient } from '../utils';
import { AGENT_STAKING_ABI, BITTE_VIRTUAL_TOKEN_ABI } from '../abi';
import {
  getAgentStaking,
  getBitteToken,
  getBitteVirtualToken,
  getVirtualStaking,
} from '../addresses';

export interface StakeInput {
  claimant: string;
  chainId: number;
  agent: string;
  amount: number;
}

export const stakeParsers: FieldParser<StakeInput> = {
  claimant: addressField,
  chainId: numberField,
  agent: addressField,
  amount: floatField,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = validateInput<StakeInput>(searchParams, stakeParsers);

    const claimant = getAddress(input.claimant);
    const agent = getAddress(input.agent);
    const chainId = input.chainId;
    const amountInWei = parseEther(input.amount.toString());

    const virtualTokenAddress = getBitteVirtualToken(chainId);
    const stakingAddress = getAgentStaking(chainId);
    const bitteTokenAddress = getBitteToken(chainId);
    const virtualStakingAddress = getVirtualStaking(chainId);
    const client = getClient(chainId);

    const [balance, isListedAgent, virtualStakingFunded] =
      await client.multicall({
        contracts: [
          {
            address: virtualTokenAddress,
            abi: BITTE_VIRTUAL_TOKEN_ABI,
            functionName: 'balanceOf',
            args: [claimant],
          },
          {
            address: stakingAddress,
            abi: AGENT_STAKING_ABI,
            functionName: 'agents',
            args: [agent],
          },
          {
            address: bitteTokenAddress,
            abi: BITTE_VIRTUAL_TOKEN_ABI,
            functionName: 'balanceOf',
            args: [virtualStakingAddress],
          },
        ],
        allowFailure: false,
      });

    if (virtualStakingFunded === 0n) {
      return NextResponse.json(
        {
          error: `Staking is not live. The virtual staking contract has not been funded.`,
        },
        { status: 400 }
      );
    }

    if (amountInWei > balance) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Available: ${balance.toString()}, required: ${amountInWei.toString()}`,
        },
        { status: 400 }
      );
    }

    if (!isListedAgent) {
      return NextResponse.json(
        {
          error: `Agent ${agent} is not registered in the staking contract.`,
        },
        { status: 400 }
      );
    }

    const data = encodeFunctionData({
      abi: BITTE_VIRTUAL_TOKEN_ABI,
      functionName: 'delegate',
      args: [agent, amountInWei],
    });

    const signRequest = signRequestFor({
      chainId,
      from: claimant,
      metaTransactions: [
        {
          to: virtualTokenAddress,
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
          amount: input.amount,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Stake Error]', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Error generating stake tx',
      },
      { status: 500 }
    );
  }
}
