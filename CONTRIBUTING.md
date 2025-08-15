# Contributing to Supply Chain & Profit

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites
- Node.js 20 LTS (see `.nvmrc`)
- npm

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test:unit
npm run e2e:smoke
```

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No `any` types without documented TODO
- All functions must have proper type annotations

### Testing Requirements
- **Unit tests**: Required for all calculation functions (`src/lib/calc/`)
- **E2E tests**: Required for new user workflows
- **Coverage**: 90%+ on critical business logic

### Commit Hygiene
- Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- Keep commits focused and atomic
- Include test updates with feature changes

## Pull Request Process

### Before Submitting
1. **Typecheck**: `npm run typecheck`
2. **Lint**: `npm run lint`
3. **Unit tests**: `npm run test:unit`
4. **E2E smoke**: `npm run e2e:smoke -- --project=chromium`
5. **Build**: `npm run build`

### PR Checklist
- [ ] Typecheck/lint pass
- [ ] Unit tests added/updated
- [ ] E2E smoke green (Chromium)
- [ ] Changelog updated (if user-facing)
- [ ] No network calls introduced
- [ ] Cursor rules respected (Always)
- [ ] Max change set: 6 files or 300 LOC

### Critical Rules
- **No network calls**: This is a local-first application
- **No new dependencies**: Must be approved by maintainers
- **Calculation changes**: Must include unit tests proving no regression
- **Architecture changes**: Require senior developer review

## Issue Guidelines

### Bug Reports
- Include browser version and OS
- Provide steps to reproduce
- Attach relevant files (CSV, console logs)
- Use the bug report template

### Feature Requests
- Clearly describe the problem
- Propose specific solutions
- Define acceptance criteria
- Consider out-of-scope alternatives

## Release Process

### Version Bumping
- Use semantic versioning
- Update `src/lib/version.ts`
- Update `CHANGELOG.md`
- Create GitHub release via Actions

### Testing Before Release
- Full E2E suite passes
- All unit tests pass
- Manual testing completed
- Performance budgets met

## Getting Help

- **Documentation**: Check `docs/` directory
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Follow the project's technical decisions
- Respect the "no network calls" policy
