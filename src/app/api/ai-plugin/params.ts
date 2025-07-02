export const numberParam = {
  in: 'query' as const,
  required: true,
  schema: { type: 'number' as const },
};
