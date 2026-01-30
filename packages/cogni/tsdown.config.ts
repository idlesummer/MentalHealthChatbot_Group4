// Build configuration (tsdown)
// - Controls what gets built, bundled, and emitted
// - Uses tsconfig.json for TypeScript resolution and declaration rules
// - Owns entry points, output format, sourcemaps, declarations, and externals

import { defineConfig } from 'tsdown'
import pkg from './package.json' with { type: 'json' }

const tsdownConfig = defineConfig({
  // TypeScript config
  tsconfig: './tsconfig.json',

  // Entry points
  entry: ['src/index.ts'],  // library api

  // Output format
  format: ['esm'],

  // Output options
  dts: true,        // emit .d.ts type declarations
  clean: true,      // clean dist/ before build
  minify: false,    // true for smaller bundle
  sourcemap: true,  // source maps for debugging

  // Dependencies
  external: [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ],
})

export default tsdownConfig
