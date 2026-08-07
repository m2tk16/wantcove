import { readFile } from 'node:fs/promises'
import { validateCiPolicy } from './ci-policy.mjs'

let workflow = ''
try {
  workflow = await readFile('.github/workflows/ci.yml', 'utf8')
} catch {
  console.error('CI workflow is missing or unreadable.')
  process.exit(1)
}

const failures = validateCiPolicy(workflow)
if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('CI branch policy verified.')
