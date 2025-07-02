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
