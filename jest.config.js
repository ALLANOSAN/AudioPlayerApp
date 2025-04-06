module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/tests/e2e/'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node'
};
