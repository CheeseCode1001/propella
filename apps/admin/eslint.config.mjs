// eslint-config-next 16 ships flat configs directly, so FlatCompat (and its
// @eslint/eslintrc dependency) is not needed here.
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const config = [
  ...coreWebVitals,
  ...typescript,
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
]

export default config
