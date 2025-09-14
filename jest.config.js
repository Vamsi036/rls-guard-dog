export default {
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^.+\\.css$': 'jest-transform-stub',
  },
  setupFiles: ['cross-fetch/polyfill'],
};