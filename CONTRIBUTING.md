# Contributing Guidelines

Thank you for your interest in contributing to the Lemonade Tycoon project!

## Getting Started

1. Clone the repo and run `yarn install` in the root directory
2. Run `yarn dev` to start the dev server at `localhost:8080`
3. Check [GitHub Issues](https://github.com/Gamez0/lemonade-tycoon/issues) for things to work on

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) to keep this a positive environment for all contributors.

## Branch Naming

| Prefix | When to use |
|--------|-------------|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `refactor/` | Code refactor |
| `chore/` | Tooling, config, dependencies |
| `docs/` | Documentation only |

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject
```

- **type**: `feat` | `fix` | `refactor` | `chore` | `docs` | `style` | `test`
- **scope**: file or feature area (e.g. `day-scene`, `recipe`, `ui`, `ci`)
- **subject**: short, imperative, English

Examples:
```
feat(day-scene): add customer patience decay animation
fix(recipe): remove stray off() call in constructor
chore(deps): upgrade phaser to 3.88.0
docs(contributing): add branch naming conventions
```

## Pull Requests

- Title follows the same Conventional Commits format
- One purpose per PR — do not mix `feat`/`fix`/`refactor`
- Write in English
- Merged via **squash merge** — branch commits don't need to be clean, the PR title becomes the final commit message

## Language

| Context | Language |
|---------|----------|
| Commit messages | English |
| PR title & body | English |
| Code review comments | Korean or English |
| Issues | Korean or English |

## Contact

If you have any questions, feel free to reach out: [dobinshin@gmail.com](mailto:dobinshin@gmail.com)
