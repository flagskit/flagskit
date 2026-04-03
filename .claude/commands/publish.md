---
description: Publish @flagskit packages to npm. Run this manually before publishing.
allowed-tools: Bash, Read
---

Pre-publish checklist and publish workflow for @flagskit packages.

## Steps

1. **Verify tests pass**
   ```bash
   pnpm test
   ```
   Stop and report if any test fails. Do not continue.

2. **Verify build is clean**
   ```bash
   pnpm build
   ```
   Stop and report if build fails. Do not continue.

3. **Verify @flagskit/core has zero dependencies**
   Read `packages/core/package.json` and confirm `dependencies` is either absent or empty.
   If any runtime dependency exists — stop and report.

4. **Run release-it to bump version and generate changelog**
   ```bash
   pnpm exec release-it
   ```
   release-it will:
   - Analyse commits since last tag (conventional commits)
   - Suggest semver bump (patch / minor / major)
   - Generate / update CHANGELOG.md
   - Bump version in package.json
   - Create git tag

   Confirm the suggested version with the user before proceeding.

5. **Sync version to both packages**
   Read the new version from root `package.json` (set by release-it).
   Update `packages/core/package.json` and `packages/react/package.json` to the same version.

6. **Publish both packages**
   ```bash
   pnpm --filter @flagskit/core publish --access public --no-git-checks
   pnpm --filter @flagskit/react publish --access public --no-git-checks
   ```

7. **Push tag to GitHub**
   ```bash
   git push origin --follow-tags
   ```

## Notes

- Requires `npm whoami` to return your username
- Commits must follow Conventional Commits — release-it uses them to determine bump type
- `feat:` → minor bump, `fix:` → patch bump, `feat!:` or `BREAKING CHANGE` → major bump
