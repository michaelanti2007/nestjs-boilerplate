# Contributing

Thanks for your interest in contributing! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/nestjs-boilerplate.git
   cd nestjs-boilerplate
   ```
3. Install dependencies:
   ```bash
   cp .env.example .env
   npm install
   ```
4. Start PostgreSQL:
   ```bash
   docker compose --profile postgres up -d
   ```
5. Verify everything works:
   ```bash
   npm run quality:check
   ```

## Development Workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Make your changes
3. Run quality checks before committing:
   ```bash
   npm run typecheck
   npm run lint:check
   npm run test
   npm run test:e2e
   ```
4. Commit with a clear message:
   ```bash
   git commit -m "feat: add feature description"
   ```
5. Push and open a Pull Request

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `chore:` — maintenance (deps, CI, configs)
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests

## Coding Guidelines

- Follow existing patterns in the codebase
- Controllers use `try/catch` + `errorHandler.handleControllerError(...)`
- Services use `try/catch` + `throw errorHandler.handleServiceError(...)`
- Use `@ApiOperationAndResponses` for Swagger documentation
- Add unit tests for new services (see `src/**/*.spec.ts` for examples)
- Keep TypeScript strict mode happy (`npm run typecheck`)
- Zero ESLint warnings (`npm run lint:check`)

## Adding a New Module

The fastest way to scaffold a new module:

```bash
# If using Claude Code or Codex with project skills
/add-module
```

Or manually follow the pattern in any existing module (e.g., `src/attachment/`):
- Entity, DTOs, Service, Controller, Module file
- Register in `src/app.module.ts`
- Add tests

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Include tests for new functionality
- Update documentation if behavior changes
- Ensure all quality checks pass
- Fill out the PR template

## Reporting Bugs

Use the [Bug Report](https://github.com/bannaarr01/nestjs-boilerplate/issues/new?template=bug_report.md) template.

## Requesting Features

Use the [Feature Request](https://github.com/bannaarr01/nestjs-boilerplate/issues/new?template=feature_request.md) template.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
