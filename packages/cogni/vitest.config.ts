import { defineConfig } from 'vitest/config'

const vitestConfig = defineConfig({
  test: {
    globals: false,       // prefer explicit imports in test files
    environment: 'node',
  },
})

export default vitestConfig
