import typescript from 'rollup-plugin-typescript2';
import cleanup from 'rollup-plugin-cleanup';

export default {
  plugins: [typescript(), cleanup({ extensions: ['ts'] })],
  input: 'src/helphero.ts',
  output: {
    name: 'helphero',
    file: 'dist/helphero.js',
    format: 'umd'
  }
};
