// Updates version in all package package.json files.
// Called by semantic-release during the prepare step.
const fs = require('fs')
const version = process.argv[2]

if (!version) {
  console.error('Usage: node scripts/set-version.js <version>')
  process.exit(1)
}

const packages = ['packages/core', 'packages/react']
for (const pkg of packages) {
  const file = `${pkg}/package.json`
  const json = JSON.parse(fs.readFileSync(file, 'utf8'))
  json.version = version
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n')
  console.log(`${file}: ${json.version} → ${version}`)
}
