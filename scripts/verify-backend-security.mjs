import { readFile } from 'node:fs/promises'

const dataResource = await readFile('amplify/data/resource.ts', 'utf8')

const requirements = [
  {
    label: 'Collection must remain owner-scoped',
    pattern: /\.authorization\(\s*\(allow\)\s*=>\s*\[\s*allow\.owner\(\)\s*\]\s*\)/s,
  },
  {
    label: 'Collection.owner must not permit ownership reassignment',
    pattern:
      /owner\s*:\s*a\s*\.string\(\)\s*\.authorization\(\s*\(allow\)\s*=>\s*\[\s*allow\.owner\(\)\.to\(\[\s*['"]read['"]\s*,\s*['"]delete['"]\s*\]\)\s*\]\s*\)/s,
  },
  {
    label: 'Amplify Data must default to Cognito user-pool authorization',
    pattern: /defaultAuthorizationMode\s*:\s*['"]userPool['"]/,
  },
]

const failures = requirements
  .filter(({ pattern }) => !pattern.test(dataResource))
  .map(({ label }) => label)

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Backend security invariants verified.')
