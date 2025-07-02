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
  claimed: boolean;
}

export interface SummaryMeta {
  totalAmount: string;
  trancheIds: string[];
  claimedCount: number;
  unclaimedCount: number;
}

export interface SummaryResult {
  claims: ProcessedClaim[];
  meta: SummaryMeta;
}
