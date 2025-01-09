import {nodeResolve} from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: './esm/index.js',
    plugins: [
      nodeResolve(),
      terser()
    ],
    output: {
      esModule: true,
      file: './index.js',
    }
  },
  {
    input: './esm/database.js',
    plugins: [
      nodeResolve(),
      terser()
    ],
    output: {
      esModule: true,
      file: './database.js',
    }
  },
  {
    input: './esm/persistent.js',
    plugins: [
      nodeResolve(),
      terser()
    ],
    output: {
      esModule: true,
      file: './persistent.js',
    }
  },
  {
    input: './esm/shared.js',
    plugins: [
      nodeResolve(),
      // terser()
    ],
    output: {
      esModule: true,
      file: './shared.js',
    }
  },
];
