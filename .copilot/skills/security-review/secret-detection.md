# Secret Detection

## Common Secret Patterns

| Type | Pattern Example |
|------|----------------|
| AWS Access Key | `AKIA[0-9A-Z]{16}` |
| AWS Secret Key | 40-char base64 string |
| GitHub Token | `ghp_`, `gho_`, `ghs_`, `ghr_` prefix |
| Slack Token | `xoxb-`, `xoxp-`, `xoxs-` prefix |
| Generic API Key | `api_key`, `apikey`, `api-key` in assignments |
| Connection String | `postgresql://`, `mongodb://`, `redis://` with credentials |
| Private Key | `-----BEGIN RSA PRIVATE KEY-----` |
| JWT Secret | `JWT_SECRET`, `TOKEN_SECRET` in code |

## Detection Tools

### Pre-commit (Recommended)

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks

  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

### CLI Tools

```bash
# gitleaks — scan entire git history
gitleaks detect --source=. --verbose

# truffleHog — entropy-based + regex detection
trufflehog git file://. --only-verified

# detect-secrets — Yelp's tool with baseline support
detect-secrets scan > .secrets.baseline
detect-secrets audit .secrets.baseline
```

### CI Integration

```yaml
# GitHub Actions
- name: Secret Scan
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Prevention

### .gitignore

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Credentials
credentials.json
serviceAccountKey.json
*.pem
*.key

# IDE secrets
.idea/dataSources.xml
```

### Environment Variables

```bash
# .env (NEVER committed)
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
API_KEY=sk-live-abc123

# .env.example (committed — template without values)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
API_KEY=your-api-key-here
```

### Code Patterns

```js
// BAD: Hardcoded secret
const apiKey = 'sk-live-abc123def456';

// GOOD: Environment variable
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error('API_KEY environment variable is required');
```

## When a Secret is Committed

**Immediate actions (within minutes):**

1. **Rotate the secret** — Generate a new key/password/token immediately
2. **Revoke the old secret** — Disable the leaked credential
3. **Remove from history** — Use `git filter-branch` or BFG Repo-Cleaner

```bash
# BFG Repo-Cleaner (simpler than filter-branch)
bfg --replace-text passwords.txt repo.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

4. **Check for unauthorized access** — Review audit logs for the compromised credential
5. **Post-mortem** — Add pre-commit hook to prevent recurrence

## Secret Management Solutions

| Tool | Type | Best For |
|------|------|----------|
| **AWS Secrets Manager** | Cloud | AWS-native apps |
| **HashiCorp Vault** | Self-hosted/Cloud | Multi-cloud, on-prem |
| **Google Secret Manager** | Cloud | GCP-native apps |
| **Azure Key Vault** | Cloud | Azure-native apps |
| **dotenv** | Local | Development environments |
| **SOPS** | File encryption | Git-stored encrypted secrets |

## Checklist
- [ ] Pre-commit hook scans for secrets before every commit
- [ ] .gitignore blocks .env, credentials, and key files
- [ ] .env.example committed with placeholder values
- [ ] CI pipeline runs secret scanning on every PR
- [ ] All secrets stored in environment variables or secret manager
- [ ] Incident response plan for leaked secrets documented
- [ ] No hardcoded credentials in source code
