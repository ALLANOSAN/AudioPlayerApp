module.exports = {
    maxWorkers: 1,
    testTimeout: 120000,
    verbose: true,
    rootDir: '../../..',
    testMatch: ['<rootDir>/src/tests/e2e/**/*.test.ts'],
    reporters: ['detox/runners/jest/reporter'],
    globalSetup: 'detox/runners/jest/globalSetup',
    globalTeardown: 'detox/runners/jest/globalTeardown',
    testEnvironment: 'detox/runners/jest/testEnvironment',
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest'
    }
  };  