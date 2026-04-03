# FlagKit — Coding Conventions

## TypeScript

- `strict: true` always
- Prefer `type` over `interface` for data shapes
- Use `interface` only when extension/declaration merging is needed
- Generic constraints: `T extends FlagSchema` not `T extends Record<string, any>`
- No `any` — use `unknown` and narrow
- No `enum` — use string literal unions
- Export types with `export type { ... }` (isolatedModules friendly)

## Naming

- Files: `kebab-case.ts` (e.g., `define-flags.ts`, `use-flag.ts`)
- Types: `PascalCase` (e.g., `FlagSchema`, `EvaluationResult`)
- Functions: `camelCase` (e.g., `defineFlags`, `evaluateAll`)
- Constants: `SCREAMING_SNAKE_CASE` only for true constants (e.g., hash seeds)
- React components: `PascalCase` in both filename and export (e.g., `Feature.tsx` exports `Feature`)
- Test files: `*.test.ts` or `*.test.tsx` in `__tests__/` directory

## Exports

- Named exports only — NO default exports
- Each package has one `index.ts` that re-exports the public API
- Internal utilities are NOT exported from index.ts
- Public API must be explicitly listed in index.ts

## Functions

- Pure functions wherever possible
- No classes unless there's a clear lifecycle benefit
- Small functions — one function, one job
- JSDoc on all public functions:

  ```typescript
  /**
   * Evaluate a single flag for the given context.
   *
   * @param config - The flags configuration from defineFlags()
   * @param flagName - Name of the flag to evaluate
   * @param context - Current user/environment context
   * @param overrides - Optional adapter overrides (highest priority)
   * @returns Evaluation result with value and source
   */
  ```

## React

- Hooks start with `use` prefix
- Components are function components (no class components)
- Use `React.ReactNode` for children types
- Use `React.ReactElement` for return types when non-null
- Context provider pattern: create context → create provider → create hooks
- Throw descriptive errors when hooks used outside provider:

  ```typescript
  throw new Error(
    'useFlag must be used within a <FlagProvider>. ' +
    'Wrap your app in <FlagProvider flags={...}> to use feature flags.'
  );
  ```

## Testing

- Framework: Vitest
- React testing: @testing-library/react
- Test file naming: `evaluate.test.ts`, `use-flag.test.tsx`
- Test structure:

  ```typescript
  describe('evaluate()', () => {
    it('returns default value when no rules match', () => { ... });
    it('returns override value when adapter provides one', () => { ... });
    it('matches rule by context equality', () => { ... });
    it('evaluates percentage rollout consistently', () => { ... });
  });
  ```

- Core evaluation logic: aim for >95% coverage
- React components: test user-visible behavior, not implementation
- No snapshot tests

## Bundle Size

- `@flagkit/core`: target <2KB gzipped
- `@flagkit/react`: target <1.5KB gzipped (excluding core)
- Zero external dependencies in core — forever
- React package: only peer dep on `react` (>=18.0)
- Use `sideEffects: false` in package.json for tree-shaking
- No polyfills — target ES2022

## Git

- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`
- Branch naming: `feat/xxx`, `fix/xxx`
- Scope by package: `feat(core): add percentage rollout`, `fix(react): context re-render`

## npm Publishing

- Scope: `@flagskit`
- All packages must have `"publishConfig": { "access": "public" }` in package.json
- Publish command: `npm publish --access public` (or rely on publishConfig)
- Version bump: manual in v0.x, consider changesets for v1.0+
- One logical change per commit
