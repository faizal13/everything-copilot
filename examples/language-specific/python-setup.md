# Python Setup

## Tooling
- **Linter/Formatter:** Ruff (replaces Black + isort + flake8) or Black + Ruff
- **Type Checker:** mypy (`--strict` recommended)
- **Test Runner:** pytest with pytest-cov
- **Package Manager:** uv, poetry, pip + venv, or pipenv

## Type Hints
- Use type hints on all function signatures
- Use `from __future__ import annotations` for forward references
- Configure mypy in `pyproject.toml` with `strict = true`

## Skills to Enable
- `coding-standards/python.md` — PEP 8, type hints, pythonic patterns
- `test-driven-development/pytest-patterns.md` — Fixtures, parametrize, markers

## AGENTS.md Snippet

```markdown
## Python Project Rules
- All functions have type hints (parameters and return type)
- Use f-strings for string formatting (not .format() or %)
- Virtual environment required (managed by uv, poetry, or venv)
- pytest as test runner with minimum 80% coverage
- Ruff/Black formatting enforced via pre-commit
- Imports organized: stdlib, third-party, local (isort order)
- No mutable default arguments (use None + conditional assignment)
```

## Common Gotchas
- **Mutable defaults:** `def f(x=[])` shares the list across calls — use `None`
- **Import resolution:** Set `PYTHONPATH` or use `src/` layout with pyproject.toml
- **Virtual envs:** Always activate before installing packages
- **Dependency conflicts:** Use `uv pip compile` or `poetry lock` for reproducible builds
