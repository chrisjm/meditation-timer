# Meditation Timer

A beautiful and minimal meditation timer built with SvelteKit to help you focus on your practice. Features ambient sounds, interval bells, and customizable meditation sessions.

## Features

- Clean, distraction-free interface
- Customizable meditation duration and presets
- Ambient background audio with optional interval bells
- Support for long sessions with wake lock handling
- Works well on desktop and mobile
- Dark mode support

## Development

This project uses `pnpm` as the package manager.

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Build for production
pnpm build

# Preview the built app
pnpm preview
```

## Testing & quality

```bash
# Lint and format
pnpm lint
pnpm format

# Type-check
pnpm check

# Unit tests
pnpm test:unit

# End-to-end tests
pnpm test:e2e

# Full test suite (unit + e2e)
pnpm test

# Recommended before releasing (lint + check + tests)
pnpm validate
```

## Release process (summary)

1. Run `pnpm validate` and ensure all checks pass.
2. Update `CHANGELOG.md` under the `[Unreleased]` section.
3. Bump the `version` in `package.json` using semantic versioning.
4. Move `[Unreleased]` entries into a new version section and commit.
5. Tag the release (`vX.Y.Z`) and deploy.

## Architecture & planning

See `PLAN.md` for the high-level architecture, component structure, and future ideas.

## Privacy

This app uses Plausible Analytics to collect aggregated, privacy-friendly usage metrics.
No cookies are used, and no personal data is stored that can identify individual users.

## Credits and attribution

### Audio

- Bell sounds: [Freesound.org](https://freesound.org) (CC0 License)
- Solfeggio frequencies: uncredited (planned to be replaced with original frequencies)

## License

MIT License – see `LICENSE` for details.
