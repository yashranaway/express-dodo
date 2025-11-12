export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getEnvVarOptional(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

