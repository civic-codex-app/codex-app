// Flat config for ESLint 9. Next 16 removed `next lint`, which used to read
// an .eslintrc that this repo never had — so until now nothing linted at all.
// eslint-config-next 16 exports flat-config arrays; the three presets below
// are what `create-next-app` installs.
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // 193 sites on the day lint was switched on. Typing them is its own
      // job; until then a warning keeps the count visible without blocking.
      '@typescript-eslint/no-explicit-any': 'warn',
      // 13 sites, all the same shape: a client component reads localStorage,
      // matchMedia or the URL in a mount effect and stores it. That is the
      // hydration-safe pattern this app settled on (see the theme notes in
      // CLAUDE.md); the rule's preferred shape is useSyncExternalStore.
      // Warn so new ones are noticed, without reopening those fixes here.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/**',
    // Design exports, not app code.
    'poli-mobile-screens/**',
  ]),
])
