import { type Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';

const DUMMY: Address = '0x9EE7173aE1116E3150d3B9dFd427C12cb777FB5d';

export const BITTE_TOKEN: Record<number, Address> = {
  [base.id]: DUMMY,
  [baseSepolia.id]: '0x93e67DA623385eb6f15b5cdf67DC9E82b1F154E2',
};

export const AGENT_STAKING: Record<number, Address> = {
  [base.id]: DUMMY,
  [baseSepolia.id]: '0x72bbc3888d5E3cEc1FF41eA67E095623C383f2E5',
};

export const DELEGATE_STAKING: Record<number, Address> = {
  [base.id]: DUMMY,
  [baseSepolia.id]: '0x80Bc786e46084a31e9015bcd2b913d2f06E39b57',
};

export const REWARDS_DISTRIBUTOR: Record<number, Address> = {
  [base.id]: DUMMY,
  [baseSepolia.id]: '0x8868500c66999d06008de5097B49960570A8B9A0',
};

export const WETH: Record<number, Address> = {
  [base.id]: '0x4200000000000000000000000000000000000006',
  [baseSepolia.id]: '0xf1213d8E59a56E740dEc35fcEeB14a9287285bde',
};

export const VIRTUAL_STAKING: Record<number, Address> = {
  [base.id]: DUMMY,
  [baseSepolia.id]: '0x8574FB95c76eB56929d6B36E378495dC0C522A66',
};

export const BITTE_VIRTUAL_TOKEN: Record<number, Address> = {
  [base.id]: DUMMY,
  [baseSepolia.id]: '0x665E63dD9558cd66414bc0205172B9B32Ba99f0b',
};
