export const numberParam = {
  in: 'query' as const,
  required: true,
  schema: { type: 'number' as const },
};

export const numberArrayStringParam = {
  in: 'query' as const,
  required: true,
  schema: {
    type: 'string' as const,
    description: 'Comma-separated list of numbers.',
  },
  example: '1,2,3',
};
