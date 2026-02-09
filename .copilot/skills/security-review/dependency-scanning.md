# Dependency Vulnerability Scanning

## By Language

### JavaScript / Node.js
```bash
# Built-in
npm audit
npm audit --production          # Only production deps
npm audit fix                   # Auto-fix where possible

# Yarn
yarn audit

# pnpm
pnpm audit
```

### Python
```bash
# pip-audit (recommended)
pip install pip-audit
pip-audit
pip-audit -r requirements.txt

# safety (alternative)
pip install safety
safety check
```

### Go
```bash
# Built-in (Go 1.18+)
govulncheck ./...

# Also checks via: go list -m -json all | nancy sleuth
```

### Rust
```bash
cargo install cargo-audit
cargo audit
cargo audit fix               # Auto-fix where possible
```

## SBOM Generation

Generate a Software Bill of Materials for compliance and tracking:

```bash
# CycloneDX format
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# SPDX format
npx spdx-sbom-generator

# Python
pip install cyclonedx-bom
cyclonedx-py -o sbom.json
```

## CI/CD Integration

```yaml
# GitHub Actions example
- name: Security audit
  run: |
    npm audit --audit-level=high
    # Exit code != 0 if high/critical vulnerabilities found

- name: Dependency review (on PR)
  uses: actions/dependency-review-action@v3
  with:
    fail-on-severity: high
```

## Automated Services

| Service | Features | Languages |
|---------|----------|-----------|
| **Dependabot** | Auto-PRs for updates, security alerts | All major |
| **Snyk** | Deep scanning, fix PRs, license compliance | All major |
| **Socket** | Supply chain attack detection | npm, PyPI |
| **Renovate** | Dependency update automation | All major |

## Remediation Workflow

1. **Triage** — Is this vulnerability exploitable in your context?
2. **Patch** — Update to a patched version (`npm audit fix`)
3. **Upgrade** — If patch unavailable, upgrade to next major version
4. **Replace** — If unmaintained, find an alternative library
5. **Accept risk** — If none of the above work, document the risk and monitor

```bash
# Check if a vulnerability is exploitable
# Ask: Does my code use the vulnerable function/module?
# If not, it may be acceptable risk (document decision)
```

## Lock File Security

- Always commit lock files (`package-lock.json`, `poetry.lock`, `go.sum`)
- Review lock file changes in PRs — unexpected changes may indicate supply chain attack
- Use `npm ci` (not `npm install`) in CI to install exact versions from lockfile
- Enable lock file maintenance in Dependabot/Renovate

## Checklist
- [ ] Dependency scan runs on every PR
- [ ] High/critical vulnerabilities block merge
- [ ] Dependabot or Renovate configured for auto-updates
- [ ] SBOM generated for compliance tracking
- [ ] Lock files committed and reviewed in PRs
- [ ] Remediation SLA defined (critical: 24h, high: 7d, medium: 30d)
