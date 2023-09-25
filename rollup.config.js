const typescript = require('rollup-plugin-typescript2');
const cleanup = require('rollup-plugin-cleanup');

module.exports = {
  plugins: [typescript(), cleanup({ extensions: ['ts'] })],
  input: 'src/helphero.ts',
  output: {
    name: 'helphero',
    file: 'dist/helphero.js',
    format: 'umd'
  }
};
