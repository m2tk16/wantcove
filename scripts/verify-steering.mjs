import { readFile } from 'node:fs/promises'

const requirements = new Map([
  ['AGENTS.md', ['Every meaningful change', 'npm run check:fast']],
  ['.agents/WORKFLOW.md', ['## Priorities', '## Test policy', '## Amplify Gen 2 boundaries']],
  ['.agents/PROJECT_LOG.md', ['## 2026-08-06', '### Verification']],
  ['.agents/FEATURE_BACKLOG.md', ['## Candidate features', 'P1 Security']],
  ['.agents/ENVIRONMENTS.md', ['Beta', 'Production', '`beta`', '`main`']],
  ['.agents/ARCHITECTURE.md', ['## Structure', '## Rules', '## Dependency direction']],
  ['.agents/LEGAL.md', ['## Terms review triggers', '## Privacy review triggers', '## Affiliate disclosure rules']],
])

const failures = []

for (const [file, markers] of requirements) {
  try {
    const contents = await readFile(file, 'utf8')
    for (const marker of markers) {
      if (!contents.includes(marker)) failures.push(`${file} is missing: ${marker}`)
    }
  } catch {
    failures.push(`${file} is missing or unreadable`)
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Steering files verified.')
