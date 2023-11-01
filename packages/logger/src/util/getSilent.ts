const testEnvironments = ['test', 'e2e'];

export default function getSilent() {
  const nodeEnv = process.env.NODE_ENV as string;
  if (!nodeEnv) {
    return false;
  }
  const isTest = testEnvironments.includes(nodeEnv);
  return isTest;
}
