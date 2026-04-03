# FlagsKit — Agent Instructions

## Commands

```bash
pnpm test                                  # run all tests
pnpm test:watch                            # watch mode
pnpm build                                 # build all packages (ESM + CJS + DTS)
pnpm --filter @flagskit/core test          # test one package
pnpm --filter @flagskit/core build         # build one package
```

## Architecture rules (enforce strictly)

- **`@flagskit/core` has zero dependencies.** If you add an import in `packages/core/`, it must come from `./` (local). Never import from `react` or any npm package.
- **`@flagskit/react` depends on core via `workspace:*`.** React is a peer dep only.
- **Rules evaluate top-to-bottom.** First matching rule wins. Never reorder rules without understanding the impact.
- **MurmurHash3 is inline in `hash.ts`.** Do not replace with an npm package.

## Code style (non-negotiable)

- `type` over `interface` for data shapes
- No `enum` — use string literal unions
- No default exports — named only
- File names: `kebab-case.ts`
- One concept per file
- JSDoc on all public exports
- Tests in `__tests__/` alongside source

## Never touch

- `pnpm-lock.yaml` — managed by pnpm automatically
- `packages/*/dist/` — build output, gitignored
- `.env` files

## When adding a new feature

1. Add types to `packages/core/src/types.ts`
2. Implement in appropriate file (keep files small)
3. Export from `packages/core/src/index.ts`
4. Write tests in `__tests__/`
5. Run `pnpm test` — all 47 tests must stay green

## Packages

```
@flagskit/core    packages/core/    zero deps, framework-agnostic
@flagskit/react   packages/react/   peer: react >=18
```

## References

- `.claude/docs/SPEC.md` — full API specification
- `.claude/docs/ROADMAP.md` — what's planned per version
- `.claude/docs/CONVENTIONS.md` — detailed code style rules
- `.claude/docs/EXAMPLES.md` — target DX, use as acceptance criteria
- `.claude/docs/COMPETITIVE.md` — market positioning
