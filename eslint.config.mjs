import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // === Next.js base rules ===
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // === Custom ignores ===
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },

  // === Custom style rules ===
  {
    rules: {
      semi: ['warn', 'never'],                            // No semicolons
      quotes: ['warn', 'single', { avoidEscape: true }],  // Single quotes for JS/TS
      'jsx-quotes': ['warn', 'prefer-double'],            // Double quotes for JSX
      'comma-dangle': ['warn', 'always-multiline'],       // enforce for multiline objects/arrays
      'object-curly-spacing': ['warn', 'always'],         // spacing / formatting consistency
    },
  },
]

export default eslintConfig
