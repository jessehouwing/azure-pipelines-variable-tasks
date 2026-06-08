import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/vsts-variable-transform.ts',
  output: {
    file: 'dist/vsts-variable-transform.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'auto',
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
      composite: false,
      incremental: false,
      module: 'ESNext',
      moduleResolution: 'Bundler',
      outDir: 'dist',
    }),
  ],
};
