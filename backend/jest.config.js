/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: ['src/**/*.js', '!**/node_modules/**'],
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-atlas.js'],
};
