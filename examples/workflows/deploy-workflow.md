# Workflow: Deployment

Workflow for deployment tasks using the everything-copilot toolkit. Covers
pre-deploy checks, environment validation, deployment execution, and
post-deploy verification.

---

## Phase 1: Pre-Deploy Checks

**Purpose:** Verify the build is ready for deployment

```bash
# 1. Ensure all tests pass
npm test

# 2. Run linters and type checking
npm run lint
npm run typecheck

# 3. Build the production artifact
npm run build

# 4. Run security audit on dependencies
npm audit --production

# 5. Verify the Docker image builds successfully
docker build -t myapp:$(git rev-parse --short HEAD) .
```

**Gate criteria:** All five steps must succeed before proceeding. If any step
fails, fix the issue and restart the pre-deploy checks.

---

## Phase 2: Environment Validation

**Purpose:** Confirm the target environment is ready to receive the deployment

```bash
# Check required environment variables are set
for var in DATABASE_URL REDIS_URL JWT_SECRET SENTRY_DSN; do
  if [ -z "${!var}" ]; then
    echo "MISSING: $var"
    exit 1
  fi
done

# Verify database connectivity
npx prisma db execute --stdin <<< "SELECT 1"

# Verify Redis connectivity
redis-cli -u "$REDIS_URL" ping

# Check disk space and memory on target
ssh deploy@production "df -h / && free -m"

# Verify TLS certificates are not expiring within 30 days
echo | openssl s_client -connect api.myapp.com:443 2>/dev/null | \
  openssl x509 -noout -enddate
```

**Checklist before deploying:**
- [ ] Database migrations are backward-compatible with the current version.
- [ ] Feature flags are configured for any gradual rollout.
- [ ] Rollback plan is documented and tested.
- [ ] On-call engineer is notified of the deployment window.

---

## Phase 3: Database Migration (if applicable)

**Purpose:** Apply schema changes before deploying new application code

```bash
# 1. Take a database backup before migration
pg_dump "$DATABASE_URL" > backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql

# 2. Run migrations in dry-run mode first
npx prisma migrate deploy --dry-run

# 3. Apply migrations
npx prisma migrate deploy

# 4. Verify migration applied correctly
npx prisma db execute --stdin <<< "SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 3"
```

If migration fails, restore from backup and abort the deployment.

---

## Phase 4: Deploy

**Purpose:** Roll out the new application version

```bash
# Option A: Container-based deployment (ECS/Kubernetes)
aws ecs update-service \
  --cluster production \
  --service myapp-api \
  --force-new-deployment \
  --desired-count 3

# Option B: Blue-green deployment
aws deploy create-deployment \
  --application-name myapp \
  --deployment-group production \
  --revision revisionType=S3,bucket=myapp-deploy,key=builds/latest.zip

# Wait for deployment to stabilize
aws ecs wait services-stable \
  --cluster production \
  --services myapp-api
```

Monitor the deployment progress. Watch for task failures or crash loops.

---

## Phase 5: Post-Deploy Verification

**Purpose:** Confirm the deployment is healthy

```bash
# 1. Health check
curl -sf https://api.myapp.com/health | jq .

# 2. Smoke test critical endpoints
curl -sf https://api.myapp.com/api/v1/status
curl -sf -X POST https://api.myapp.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"smoketest"}'

# 3. Check error rates in monitoring
# Verify no spike in 5xx errors in the first 10 minutes

# 4. Verify logs are flowing
aws logs tail /ecs/myapp-api --since 5m --follow
```

**Post-deploy checklist:**
- [ ] Health endpoint returns 200.
- [ ] Login flow works end-to-end.
- [ ] Error rate is within normal range (below 0.1%).
- [ ] Response times are within SLA (p99 under 500ms).
- [ ] No new errors in Sentry/error tracking.

---

## Rollback Procedure

If post-deploy verification fails:

```bash
# 1. Roll back to previous task definition
aws ecs update-service \
  --cluster production \
  --service myapp-api \
  --task-definition myapp-api:PREVIOUS_VERSION

# 2. Roll back database migration if needed
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# 3. Notify the team
echo "Deployment rolled back. Reason: [describe issue]" | \
  slack-notify --channel deploys
```

---

## Agents and Commands Used

| Phase | Tool | Purpose |
|-------|------|---------|
| Pre-deploy | Bash (tests, build) | Verify build readiness |
| Environment | Bash (connectivity) | Validate target environment |
| Migration | Prisma CLI | Apply database changes |
| Deploy | AWS CLI / Docker | Roll out new version |
| Verification | curl, monitoring | Confirm healthy deployment |
| Rollback | AWS CLI, Prisma | Revert if issues detected |
