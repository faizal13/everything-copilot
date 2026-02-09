# Python Coding Standards

## PEP 8 Essentials

### Naming Conventions
- **snake_case** for functions, variables, modules: `get_user_name`, `total_count`
- **PascalCase** for classes: `UserService`, `HttpClient`
- **UPPER_SNAKE_CASE** for module-level constants: `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT`
- **_single_leading_underscore** for internal use: `_parse_config`
- **__double_leading_underscore** for name mangling (rare, avoid unless needed)

### Line Length and Formatting
- Maximum 88 characters per line (Black default) or 79 (strict PEP 8)
- Use Black for formatting, isort for import sorting
- 4 spaces per indentation level, never tabs

## Type Hints (Required for all new code)

### Function Signatures
```python
from typing import Optional
from collections.abc import Sequence

def get_user(user_id: int) -> Optional[User]:
    """Fetch a user by ID, returning None if not found."""
    ...

def process_items(items: Sequence[str], *, batch_size: int = 100) -> list[str]:
    """Process items in batches. Use keyword-only args after *."""
    ...
```

### Modern Type Hint Syntax (Python 3.10+)
```python
# PREFER: built-in generics and union syntax
def fetch(url: str, timeout: int | None = None) -> dict[str, Any]:
    ...

# AVOID: older typing imports when possible
from typing import Dict, Optional, Union  # not needed in 3.10+
```

### TypedDict for Structured Data
```python
from typing import TypedDict, NotRequired

class UserPayload(TypedDict):
    name: str
    email: str
    role: NotRequired[str]
```

## Pythonic Patterns

### Comprehensions over map/filter
```python
# GOOD
active_names = [u.name for u in users if u.is_active]
user_map = {u.id: u for u in users}

# AVOID for simple transformations
active_names = list(map(lambda u: u.name, filter(lambda u: u.is_active, users)))
```

### Context Managers
```python
# GOOD: automatic resource cleanup
from contextlib import contextmanager

@contextmanager
def database_transaction(conn):
    tx = conn.begin()
    try:
        yield tx
        tx.commit()
    except Exception:
        tx.rollback()
        raise

# Usage
with database_transaction(conn) as tx:
    tx.execute(query)
```

### Dataclasses for Value Objects
```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass(frozen=True)
class Event:
    name: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    tags: list[str] = field(default_factory=list)
```

## Error Handling

### Specific Exception Types
```python
# GOOD: catch specific exceptions
try:
    result = json.loads(raw_data)
except json.JSONDecodeError as e:
    logger.error("Invalid JSON payload", exc_info=e)
    raise ValidationError(f"Malformed JSON: {e}") from e

# BAD: bare except or overly broad
try:
    result = json.loads(raw_data)
except Exception:
    pass
```

### Custom Exceptions
```python
class AppError(Exception):
    """Base exception for application errors."""
    def __init__(self, message: str, code: str, status: int = 500):
        super().__init__(message)
        self.code = code
        self.status = status

class NotFoundError(AppError):
    def __init__(self, resource: str, resource_id: str | int):
        super().__init__(
            f"{resource} {resource_id} not found",
            code="NOT_FOUND",
            status=404,
        )
```

## Virtual Environments

### Project Setup
```bash
# Create venv
python -m venv .venv

# Activate
source .venv/bin/activate  # Unix
.venv\Scripts\activate     # Windows

# Use pip-tools for reproducible deps
pip install pip-tools
pip-compile requirements.in        # generates requirements.txt
pip-sync requirements.txt          # installs exactly what is listed
```

### pyproject.toml (Modern Standard)
```toml
[project]
name = "my-service"
version = "1.0.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.100",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = ["pytest>=7.0", "black", "mypy", "ruff"]
```

## Import Organization
```python
# 1. Standard library
import os
import sys
from pathlib import Path

# 2. Third-party packages
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# 3. Local application imports
from app.services.user import UserService
from app.models import User
```

## Logging (never use print in production)
```python
import logging

logger = logging.getLogger(__name__)

# Structured logging
logger.info("User created", extra={"user_id": user.id, "role": user.role})
logger.error("Payment failed", exc_info=True, extra={"order_id": order_id})
```

## Checklist
- [ ] All functions have type hints for parameters and return values
- [ ] No mutable default arguments (`def f(items=[])` is a bug)
- [ ] `pathlib.Path` over `os.path` for file operations
- [ ] f-strings over `.format()` or `%` formatting
- [ ] `logging` module over `print` statements
- [ ] Docstrings on all public functions and classes
- [ ] No wildcard imports (`from module import *`)
- [ ] `ruff` or `flake8` passes with no warnings
- [ ] `mypy --strict` passes or all errors are explicitly suppressed with reason
- [ ] Tests use `pytest` conventions (functions, not classes unless grouping is needed)
