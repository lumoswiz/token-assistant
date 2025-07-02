import { type Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';

const DUMMY: Address = '0x9EE7173aE1116E3150d3B9dFd427C12cb777FB5d';

export const BITTE_TOKEN: Record<number, Address> = {
  [base.id]: DUMMY,
  [baseSepolia.id]: '0xE67920Dc41ecCac023850036434E1122c1E8D2A5',
};

export const AGENT_STAKING: Record<number, Address> = {
  [base.id]: DUMMY,
  [baseSepolia.id]: '0x80BC777B7aAd56736cBC36B99989cD6dc864c533',
};

export const DELEGATE_STAKING: Record<number, Address> = {
  [base.id]: DUMMY,
  [baseSepolia.id]: '0xbF6D376A0a99D8Dc9C8A9617058cc72dBb465cC7',
};

export const REWARDS_DISTRIBUTOR: Record<number, Address> = {
  [base.id]: DUMMY,
  [baseSepolia.id]: '0x5B41927251945584785aD1D036D060b5E47B6a16',
};

export const WETH: Record<number, Address> = {
  [base.id]: '0x4200000000000000000000000000000000000006',
  [baseSepolia.id]: '0x1F77ca71Ec6477a3E659536C0047002eF44DBFd4',
};

export const VIRTUAL_STAKING: Record<number, Address> = {
  [base.id]: DUMMY,
  [baseSepolia.id]: '0x915142E78E78A704233E0b9b20CB0035463E496f',
};

export const BITTE_VIRTUAL_TOKEN: Record<number, Address> = {
  [base.id]: DUMMY,
  [baseSepolia.id]: '0xEC0807c715dCB7340c236Ae82976B8fF2A81De2f',
};
