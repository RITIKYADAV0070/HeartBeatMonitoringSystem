module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    '*.ts',
    '!*.test.ts',
    '!jest.config.js'
  ]
};