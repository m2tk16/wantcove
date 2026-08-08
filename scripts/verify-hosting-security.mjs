import { readdir, readFile, stat } from 'node:fs/promises'
import { validateHostingSecurityPolicy } from './hosting-security-policy.mjs'

const policy = await readFile(new URL('../customHttp.yml', import.meta.url), 'utf8')
const failures = validateHostingSecurityPolicy(policy)
const productDirectory = new URL('../public/products/', import.meta.url)
const productNames = ['adjustable-dumbbells', 'globe-lamp', 'pizza-oven', 'wireless-earbuds']
const widths = new Map([
  ['globe-lamp', [480, 960, 1440]],
  ['adjustable-dumbbells', [480, 960, 1200]],
  ['pizza-oven', [480, 960, 1200]],
  ['wireless-earbuds', [480, 960, 1200]],
])
const expectedFiles = productNames.flatMap((name) => widths.get(name).flatMap((width) => [
  `${name}-${width}.avif`,
  `${name}-${width}.webp`,
]))
const actualFiles = await readdir(productDirectory)
const optimizedFiles = actualFiles.filter((name) => /\.(?:avif|webp)$/i.test(name))

for (const file of expectedFiles) {
  if (!actualFiles.includes(file)) failures.push(`Optimized product asset is missing: ${file}`)
}
for (const file of actualFiles.filter((name) => /\.(?:png|jpe?g)$/i.test(name))) {
  failures.push(`Legacy product asset must be removed after responsive conversion: ${file}`)
}

let totalBytes = 0
for (const file of optimizedFiles) {
  const { size } = await stat(new URL(file, productDirectory))
  totalBytes += size
  if (size > 150_000) failures.push(`Optimized product asset exceeds 150 KB: ${file}`)
}
if (totalBytes > 1_000_000) failures.push(`Optimized product assets exceed the 1 MB total budget: ${totalBytes} bytes`)

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Hosting security and ${optimizedFiles.length} optimized product assets verified (${totalBytes} bytes).`)
