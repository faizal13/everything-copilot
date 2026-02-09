# Pytest Patterns

## Fixtures

```python
import pytest

@pytest.fixture
def db_connection():
    """Yield fixture with setup/teardown."""
    conn = create_connection()
    yield conn
    conn.close()

@pytest.fixture(scope="module")
def app_client(db_connection):
    """Module-scoped fixture — shared across tests in the module."""
    app = create_app(db=db_connection)
    return app.test_client()

# Autouse: applies to ALL tests in scope
@pytest.fixture(autouse=True)
def reset_cache():
    cache.clear()
    yield
    cache.clear()
```

**Fixture scopes:** `function` (default) → `class` → `module` → `session`

## Parametrize

Data-driven tests without duplication:

```python
@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("world", "WORLD"),
    ("", ""),
    ("123", "123"),
])
def test_uppercase(input, expected):
    assert to_upper(input) == expected

# Multiple parameters
@pytest.mark.parametrize("x", [1, 2])
@pytest.mark.parametrize("y", [10, 20])
def test_multiply(x, y):
    assert multiply(x, y) == x * y  # Runs 4 combinations
```

## Markers

```python
# Built-in markers
@pytest.mark.skip(reason="Not implemented yet")
def test_future_feature(): ...

@pytest.mark.skipif(sys.platform == "win32", reason="Unix only")
def test_unix_permissions(): ...

@pytest.mark.xfail(reason="Known bug #123")
def test_known_bug(): ...

# Custom markers (register in pytest.ini or pyproject.toml)
@pytest.mark.slow
def test_full_integration(): ...

# Run only specific markers
# pytest -m "not slow"
# pytest -m "slow and integration"
```

## conftest.py

Shared fixtures and hooks, auto-discovered by pytest:

```python
# conftest.py at project root
import pytest

@pytest.fixture
def sample_user():
    return {"id": 1, "name": "Alice", "email": "alice@example.com"}

@pytest.fixture
def mock_api(monkeypatch):
    """Monkeypatch external API calls."""
    def fake_fetch(url):
        return {"status": 200, "data": []}
    monkeypatch.setattr("myapp.api.fetch", fake_fetch)

# Nested conftest.py in subdirectories override/extend parent
```

## Mocking

```python
from unittest.mock import MagicMock, patch, AsyncMock

# Patching
@patch("myapp.services.send_email")
def test_registration(mock_send):
    register_user("alice@example.com")
    mock_send.assert_called_once_with("alice@example.com", subject="Welcome")

# Context manager
def test_payment():
    with patch("myapp.payment.charge") as mock_charge:
        mock_charge.return_value = {"status": "success"}
        result = process_order(order)
        assert result.paid is True

# pytest-mock (cleaner API)
def test_with_mocker(mocker):
    mock_db = mocker.patch("myapp.db.query")
    mock_db.return_value = [{"id": 1}]
    users = get_users()
    assert len(users) == 1
```

## Async Testing

```python
import pytest

@pytest.mark.asyncio
async def test_async_fetch():
    result = await fetch_data("https://api.example.com/data")
    assert result["status"] == "ok"

# Async fixture
@pytest.fixture
async def async_client():
    async with AsyncClient(app=app) as client:
        yield client
```

## Coverage

```ini
# pyproject.toml
[tool.pytest.ini_options]
addopts = "--cov=src --cov-report=term-missing --cov-fail-under=80"

[tool.coverage.run]
omit = ["tests/*", "*/migrations/*"]
```

```bash
pytest --cov=myapp --cov-report=html
```

## Checklist
- [ ] Fixtures use appropriate scope (prefer `function` for isolation)
- [ ] `conftest.py` holds shared fixtures (no circular imports)
- [ ] `parametrize` used for data-driven tests (not copy-paste)
- [ ] External dependencies mocked at boundaries
- [ ] Coverage configured with `--cov-fail-under=80`
- [ ] Custom markers registered in `pyproject.toml`
- [ ] Async tests marked with `@pytest.mark.asyncio`
