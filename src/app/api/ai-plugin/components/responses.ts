export const SummaryResponse200 = {
  description: 'Successful summary response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['success', 'claims', 'meta'],
        properties: {
          success: { type: 'boolean' },
          claims: {
            type: 'array',
            items: {
              type: 'object',
              required: [
                'trancheId',
                'index',
                'claimant',
                'claimableAmount',
                'proof',
                'claimType',
                'claimTypeName',
                'cliff',
                'vesting',
                'claimed',
              ],
              properties: {
                trancheId: { type: 'string' },
                index: { type: 'number' },
                claimant: { $ref: '#/components/schemas/Address' },
                claimableAmount: { type: 'string' },
                proof: {
                  type: 'array',
                  items: { type: 'string' },
                },
                claimType: {
                  type: 'integer',
                  description: 'Numeric claim type for on-chain transaction',
                },
                claimTypeName: {
                  type: 'string',
                  description: 'Human-readable claim type label',
                },
                cliff: {
                  type: 'string',
                  description: 'Cliff period (e.g. “12 months” or “12 days”)',
                },
                vesting: {
                  type: 'string',
                  description:
                    'Vesting duration (e.g. “24 months” or “24 days”)',
                },
                claimed: {
                  type: 'boolean',
                  description:
                    'Whether this tranche/index has already been claimed on-chain',
                },
              },
            },
          },
          meta: {
            type: 'object',
            required: [
              'totalAmount',
              'trancheIds',
              'chainId',
              'claimedCount',
              'unclaimedCount',
            ],
            properties: {
              totalAmount: { type: 'string' },
              trancheIds: {
                type: 'array',
                items: { type: 'string' },
              },
              chainId: {
                type: 'integer',
                description: 'The chain ID used for this summary check',
              },
              claimedCount: {
                type: 'integer',
                description: 'Number of claims already claimed',
              },
              unclaimedCount: {
                type: 'integer',
                description: 'Number of claims not yet claimed',
              },
            },
          },
        },
      },
    },
  },
};

export const BalanceResponse200 = {
  description: 'Balance summary response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              balanceOf: { type: 'string', example: '1000000000000000000' },
              swappableBalanceOf: {
                type: 'string',
                example: '500000000000000000',
              },
              chainId: { type: 'number', example: 8453 },
              claimant: { type: 'string', example: '0x1234567890abcdef...' },
            },
            required: [
              'balanceOf',
              'swappableBalanceOf',
              'chainId',
              'claimant',
            ],
          },
        },
        required: ['success', 'data'],
      },
    },
  },
};

export const VirtualStakingStatusResponse200 = {
  description: 'Virtual staking status response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['success', 'canVirtualStake', 'chainId'],
        properties: {
          success: { type: 'boolean', example: true },
          canVirtualStake: {
            type: 'boolean',
            description:
              'True if virtual staking contract is funded and virtual staking is enabled',
          },
          chainId: { type: 'integer', example: 8453 },
        },
      },
    },
  },
};

export const GetAgentsResponse200 = {
  description: 'List of agent contract addresses',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['success', 'chainId', 'agents'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          chainId: {
            type: 'integer',
            example: 8453,
            description: 'Chain ID from the request',
          },
          agents: {
            type: 'array',
            description: 'List of agent contract addresses',
            items: {
              type: 'string',
              format: 'address',
              example: '0x4AAC49716981a089b28d59eDF32579ca96243727',
            },
          },
        },
      },
    },
  },
};
