# DevOps Team Configuration

## Recommended Agents
- **Build Error Resolver** — CI/CD pipeline failures, build issues
- **Security Reviewer** — Infrastructure security, secret management
- **Architect** — Infrastructure design, cost optimization

## Skills to Enable
- `security-review` — Dependency scanning, secret detection
- `strategic-compact` — Token optimization for long infrastructure sessions

## AGENTS.md Additions

```markdown
## Infrastructure Review Rules
- All infrastructure changes must go through Terraform plan review
- Production deployments require approval from 2+ team members
- No hardcoded IPs, credentials, or environment-specific values
- All resources must have tags: team, environment, cost-center
- Rollback procedure documented for every deployment
- Blast radius assessed before applying changes
- Cost impact estimated for new resources
```

## Recommended MCP Tools
- Kubernetes MCP (pod management, logs, deployments)
- Terraform MCP (plan, apply, state inspection)
- Datadog / New Relic (monitoring, alerting)
- AWS/GCP/Azure CLIs (cloud resource management)

## Conventions
- IaC: Terraform for infrastructure, Helm for Kubernetes
- Naming: `{env}-{service}-{resource}` (e.g., `prod-api-rds`)
- Environments: dev → staging → production
- Secrets: managed via vault or cloud secret manager
- Monitoring: alerts on error rate, latency p99, resource utilization
