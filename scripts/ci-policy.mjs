const requiredFragments = new Map([
  ['Beta pull-request checks', 'pull_request:\n    branches: [beta, main]'],
  ['Beta and Production push checks', 'push:\n    branches: [beta, main]'],
  ['read-only repository permission', 'permissions:\n  contents: read'],
  ['superseded-run cancellation', 'cancel-in-progress: true'],
  ['single stable branch-policy check', 'name: Branch policy check'],
  ['Beta fast gate', 'run: npm run check:fast'],
  ['Production readiness gate', "- name: Production readiness gate\n        if: github.base_ref == 'main' || github.ref == 'refs/heads/main'\n        run: npm run verify:release"],
  ['Production full gate', 'run: npm run check:full'],
  ['immutable checkout action', 'actions/checkout@11d5960a326750d5838078e36cf38b85af677262'],
  ['immutable setup-node action', 'actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020'],
])

export function validateCiPolicy(workflow) {
  const failures = []
  for (const [requirement, fragment] of requiredFragments) {
    if (!workflow.includes(fragment)) failures.push(`CI is missing ${requirement}.`)
  }
  if (workflow.includes('pull_request_target:')) {
    failures.push('CI must not use pull_request_target for untrusted changes.')
  }
  if (/contents:[ \t]+write/.test(workflow)) {
    failures.push('CI repository contents permission must remain read-only.')
  }
  return failures
}
