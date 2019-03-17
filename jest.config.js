module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: [
    '<rootDir>/dist'
  ],
  rootDir: './',
  transform: {
    "\\.(ts|tsx)$": "ts-jest"
  },
};
