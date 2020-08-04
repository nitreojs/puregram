module.exports = {
  name: 'puregram-monorepo',
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/packages/*/test/*.test.ts']
};
