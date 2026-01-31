import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),

  // Personal style
  {
    rules: {
      'comma-dangle': ['warn', 'always-multiline'],
      'eol-last': ['warn', 'always'],
      'object-curly-spacing': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'semi': ['warn', 'never'],
    },
  },
])

export default eslintConfig
