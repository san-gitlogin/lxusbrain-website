import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignore build output and Firebase Cloud Functions (uses CommonJS)
  globalIgnores(['dist', 'functions']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow explicit any in specific cases (UI component libraries often need this)
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused vars when prefixed with underscore
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      // Allow exporting non-components from files (needed for shared utilities)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Allow setState in effects (legitimate pattern for syncing state with external data)
      'react-hooks/set-state-in-effect': 'off',
      // Allow modifying window.location (needed for external links/mailto)
      'react-hooks/immutability': 'off',
    },
  },
])
