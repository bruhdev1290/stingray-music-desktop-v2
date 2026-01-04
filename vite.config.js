/// <reference types="vitest" />
import { defineConfig } from 'vite'
import path from 'path'

// This is a legacy configuration file. The actual application build
// is located in the desktop/ directory. See desktop/vite.config.ts
// for the active Vite configuration.
export default defineConfig({
  plugins: [],
  test: {
    environment: 'jsdom'
  }
})
