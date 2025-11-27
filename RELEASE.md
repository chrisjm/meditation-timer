# Release checklist

Use this checklist for every production release.

1. Ensure your working tree is clean: `git status`.
2. Run quality checks:
   - `pnpm validate`
3. Update `CHANGELOG.md`:
   - Add entries under `[Unreleased]` for this release.
   - Create a new `## [X.Y.Z] – YYYY-MM-DD` section and move entries there.
4. Bump `version` in `package.json` using semantic versioning.
5. Commit changes with a clear message, for example: `chore(release): vX.Y.Z`.
6. Tag the release: `git tag vX.Y.Z && git push --tags`.
7. Deploy the tagged build to production.
