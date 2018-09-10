import typescript from 'rollup-plugin-typescript2';

export default {
  plugins: [typescript()],
  input: 'src/helphero.ts',
  output: {
    name: 'helphero',
    file: 'dist/helphero.js',
    format: 'umd'
  }
};
