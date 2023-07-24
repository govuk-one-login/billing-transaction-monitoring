export const getFromEnv = (variableName: string): string | undefined =>
  process.env[variableName];
