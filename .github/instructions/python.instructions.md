---
applyTo: "**/*.py"
---

# Python Instructions

- Use type hints for all function signatures
- Use `dataclasses` or `pydantic` for data structures
- Prefer `pathlib.Path` over `os.path`
- Use `f-strings` for string formatting
- Use context managers (`with`) for resource management
- Follow PEP 8 naming: `snake_case` for functions/variables, `PascalCase` for classes
- Use `pytest` for testing with fixtures
- Handle exceptions specifically — never bare `except:`
- Use `logging` module, not `print()` for production code
- Prefer list/dict comprehensions when readable
