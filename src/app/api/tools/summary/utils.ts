import { type Address } from 'viem';

export const ClaimTypeNames = [
  'Unlocked',
  'Investor',
  'Team',
  'Advisor',
  'Treasury',
  'PreSale',
] as const;
export type ClaimTypeName = (typeof ClaimTypeNames)[number];

export const ClaimDurations = [
  { cliff: 0, vest: 0 },
  { cliff: 12, vest: 24 },
  { cliff: 12, vest: 28 },
  { cliff: 12, vest: 18 },
  { cliff: 0, vest: 36 },
  { cliff: 0, vest: 36 },
] as const;

export interface MerkleClaim {
  index: number;
  claimType: number;
  claimant: Address;
  claimableAmount: string;
  proof: string[];
  trancheId: string;
}

export interface ProcessedClaim extends MerkleClaim {
  claimTypeName: ClaimTypeName;
  cliff: string;
  vesting: string;
}

export interface SummaryResult {
  claims: ProcessedClaim[];
  totalAmount: string;
  trancheIds: string[];
}

const pluralize = (n: number, unit: 'day' | 'month') =>
  `${n} ${unit}${n === 1 ? '' : 's'}`;

async function fetchMerkleClaims(): Promise<MerkleClaim[]> {
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

function enrichClaim(c: MerkleClaim, chainId: number): ProcessedClaim {
  const { cliff: C, vest: V } = ClaimDurations[c.claimType];
  const unit = chainId === 84532 ? 'day' : 'month';

  return {
    ...c,
    claimTypeName: ClaimTypeNames[c.claimType] ?? 'Unknown',
    cliff: pluralize(C, unit),
    vesting: pluralize(V, unit),
  };
}

export async function getProcessedSummary(
  claimant: Address,
  chainId: number
): Promise<SummaryResult> {
  const raw = await fetchMerkleClaims();
  const filtered = raw.filter(
    (c) => c.claimant.toLowerCase() === claimant.toLowerCase()
  );
  const claims = filtered.map((c) => enrichClaim(c, chainId));

  const totalAmount = claims
    .reduce((sum, c) => sum + BigInt(c.claimableAmount), 0n)
    .toString();

  const trancheIds = Array.from(new Set(claims.map((c) => c.trancheId)));

  return { claims, totalAmount, trancheIds };
}
