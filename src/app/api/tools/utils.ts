import { unstable_cache } from 'next/cache';
import { type Address, createPublicClient, PublicClient, http } from 'viem';
import {
  getChainById,
  addressField,
  numberField,
  floatField,
  type FieldParser,
} from '@bitte-ai/agent-sdk';

import { BITTE_VIRTUAL_TOKEN_ABI } from './abi';
import { getBitteVirtualToken } from './addresses';
import {
  ClaimTypeNames,
  ClaimDurations,
  MerkleClaim,
  ProcessedClaim,
  SummaryResult,
} from './types';

export function getClient(chainId: number): PublicClient {
  const chain = getChainById(chainId);
  const client = createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });
  return client;
}

async function _fetchMerkleClaims(): Promise<MerkleClaim[]> {
  const res = await fetch(
    'https://raw.githubusercontent.com/lumoswiz/raven-merkle-proofs/main/merkle.json',
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Failed to fetch merkle.json');

  const raw: Record<
    string,
    { root: string; data: Omit<MerkleClaim, 'trancheId'>[] }
  > = await res.json();

  return Object.entries(raw).flatMap(([trancheId, { data }]) =>
    data.map((row) => ({ ...row, trancheId }))
  );
}

export const fetchMerkleClaims = unstable_cache(_fetchMerkleClaims);

const pluralize = (n: number, unit: 'day' | 'month') =>
  `${n} ${unit}${n === 1 ? '' : 's'}`;

export function enrichClaim(
  c: MerkleClaim,
  chainId: number,
  claimed = false
): ProcessedClaim {
  const { cliff: C, vest: V } = ClaimDurations[c.claimType];
  const unit = chainId === 84532 ? 'day' : 'month';

  return {
    ...c,
    claimTypeName: ClaimTypeNames[c.claimType] ?? 'Unknown',
    cliff: pluralize(C, unit),
    vesting: pluralize(V, unit),
    claimed,
  };
}

export async function getClaimStatuses(
  chainId: number,
  claims: MerkleClaim[]
): Promise<boolean[]> {
  const client = getClient(chainId);

  const calls = claims.map((c) => ({
    address: getBitteVirtualToken(chainId),
    abi: BITTE_VIRTUAL_TOKEN_ABI,
    functionName: 'isClaimed' as const,
    args: [c.trancheId, BigInt(c.index)],
  }));

  const raw = await client.multicall({ contracts: calls });

  return raw.map((r) => {
    if (r.status === 'success') {
      return r.result as boolean;
    } else {
      return false;
    }
  });
}

export async function getProcessedSummary(
  claimant: Address,
  chainId: number,
  includeStatus = true
): Promise<SummaryResult> {
  const raw = await fetchMerkleClaims();
  const filtered = raw.filter(
    (c) => c.claimant.toLowerCase() === claimant.toLowerCase()
  );

  let claims: ProcessedClaim[];
  if (includeStatus && filtered.length > 0) {
    const statuses = await getClaimStatuses(chainId, filtered);
    claims = filtered.map((c, i) => enrichClaim(c, chainId, statuses[i]));
  } else {
    claims = filtered.map((c) => enrichClaim(c, chainId));
  }

  const totalAmount = claims
    .reduce((sum, c) => sum + BigInt(c.claimableAmount), 0n)
    .toString();

  const trancheIds = Array.from(new Set(claims.map((c) => c.trancheId)));

  const claimedCount = claims.filter((c) => c.claimed).length;
  const unclaimedCount = claims.length - claimedCount;

  return {
    claims,
    meta: {
      totalAmount,
      trancheIds,
      claimedCount,
      unclaimedCount,
    },
  };
}

export interface BalanceInput {
  claimant: string;
  chainId: number;
}

export const balanceParsers: FieldParser<BalanceInput> = {
  claimant: addressField,
  chainId: numberField,
};

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

export interface SummaryInput {
  claimant: string;
  chainId: number;
}

export const summaryParsers: FieldParser<SummaryInput> = {
  claimant: addressField,
  chainId: numberField,
};

export interface SwapAllInput {
  claimant: string;
  chainId: number;
}

export const swapAllParsers: FieldParser<SwapAllInput> = {
  claimant: addressField,
  chainId: numberField,
};

export interface VirtualStakeStatusInput {
  chainId: number;
}

export const virtualStakeStatusParsers: FieldParser<VirtualStakeStatusInput> = {
  chainId: numberField,
};

export interface GetAgentsStatusInput {
  chainId: number;
}

export const getAgentsStatusParsers: FieldParser<GetAgentsStatusInput> = {
  chainId: numberField,
};
