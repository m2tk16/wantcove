import { readFile } from 'node:fs/promises'
import { validateProductionReadiness } from './production-readiness-policy.mjs'

let profile
try {
  profile = JSON.parse(await readFile('.agents/PRODUCTION_READINESS.json', 'utf8'))
} catch {
  console.error('Production readiness profile is missing or invalid JSON.')
  process.exit(1)
}

const failures = validateProductionReadiness(profile)
if (failures.length > 0) {
  console.error(`Production readiness is blocked:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log('Production readiness verified.')
