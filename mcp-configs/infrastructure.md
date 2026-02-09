# Infrastructure MCP Tools Guide

## Overview

Infrastructure MCP servers bring cluster management, infrastructure-as-code, container
orchestration, and cloud operations into the AI assistant workflow. This guide covers
Kubernetes, Terraform, Docker, and cloud CLI integrations with a strong emphasis on
safety controls for production environments.

---

## Kubernetes

### Setup

```bash
npm install -g mcp-server-kubernetes
```

**MCP configuration:**

```json
{
  "mcpServers": {
    "kubernetes": {
      "command": "npx",
      "args": ["-y", "mcp-server-kubernetes"],
      "env": {
        "KUBECONFIG": "~/.kube/config",
        "K8S_CONTEXT": "dev-cluster",
        "K8S_NAMESPACE": "default"
      }
    }
  }
}
```

### Available Tools
- **list_pods** - List pods with status, restarts, and age.
- **get_pod_logs** - Retrieve logs from a pod (supports container selection and tail lines).
- **describe_resource** - Describe any Kubernetes resource (pod, service, deployment, etc.).
- **list_deployments** - List deployments with replica counts and rollout status.
- **scale_deployment** - Scale a deployment to a target replica count.
- **rollout_status** - Check the status of an ongoing rollout.
- **rollout_restart** - Trigger a rolling restart of a deployment.
- **list_services** - List services with types, cluster IPs, and ports.
- **get_events** - Retrieve cluster events filtered by namespace or resource.
- **apply_manifest** - Apply a YAML manifest to the cluster.

### Usage Pattern: Incident Investigation

```
User: The payment service is returning 500 errors
Agent: [calls list_pods with label selector app=payment-service]
       -> checks pod status, identifies CrashLoopBackOff
       [calls get_pod_logs for the failing pod, tail=100]
       -> finds OOM killed, last log shows memory spike during batch job
       [calls describe_resource for the pod]
       -> confirms memory limit is 512Mi, recommends increase
```

---

## Terraform

### Setup

```bash
npm install -g mcp-server-terraform
```

**MCP configuration:**

```json
{
  "mcpServers": {
    "terraform": {
      "command": "npx",
      "args": ["-y", "mcp-server-terraform"],
      "env": {
        "TF_WORKING_DIR": "./infrastructure/terraform",
        "TF_VAR_FILE": "environments/staging.tfvars"
      }
    }
  }
}
```

### Available Tools
- **plan** - Generate and display an execution plan.
- **apply** - Apply changes (requires explicit confirmation).
- **state_list** - List all resources in the current state.
- **state_show** - Show detailed attributes of a specific resource.
- **output** - Read Terraform output values.
- **validate** - Validate configuration files for syntax and consistency.
- **drift_detect** - Compare actual infrastructure state with the desired configuration.

### Usage Pattern: Infrastructure Change Review

```
User: What would happen if we increase the RDS instance size?
Agent: [modifies instance_class in the .tf file]
       [calls plan] -> shows that only the RDS instance will be modified
       -> summarizes: 2 min downtime expected during instance resize,
          no data loss, estimated cost increase of $X/month
```

---

## Docker

Docker operations can be exposed through a generic command execution MCP or a dedicated
Docker MCP server.

### Common Operations
- **list_containers** - List running and stopped containers.
- **container_logs** - Retrieve stdout/stderr from a container.
- **container_exec** - Execute a command inside a running container.
- **image_list** - List locally available images.
- **build** - Build an image from a Dockerfile.
- **compose_up** - Start services defined in a docker-compose file.
- **compose_down** - Stop and remove compose services.

### Usage Pattern: Local Environment Debugging

```
User: My docker-compose stack keeps restarting the worker container
Agent: [calls list_containers] -> sees worker restarting every 30s
       [calls container_logs for worker, tail=50]
       -> finds connection refused to Redis on port 6379
       [checks docker-compose.yml] -> Redis depends_on is missing
       -> fixes dependency order and health check configuration
```

---

## Cloud CLIs (AWS, GCP, Azure)

Cloud provider CLIs can be wrapped as MCP tools for common operations.

### AWS Common Tools
- **s3_list** / **s3_get** - Browse and retrieve S3 objects.
- **ecs_list_services** - List ECS services and their task counts.
- **cloudwatch_query** - Run CloudWatch Logs Insights queries.
- **lambda_invoke** - Invoke a Lambda function with a test payload.
- **ssm_get_parameter** - Retrieve SSM Parameter Store values.

### GCP Common Tools
- **gcs_list** / **gcs_get** - Browse and retrieve Cloud Storage objects.
- **gke_clusters** - List GKE clusters and node pools.
- **cloud_run_services** - List Cloud Run services and revisions.
- **bigquery_query** - Execute a BigQuery SQL query.

### Azure Common Tools
- **blob_list** / **blob_get** - Browse and retrieve Blob Storage objects.
- **aks_list** - List AKS clusters.
- **app_service_list** - List App Service instances and their status.
- **monitor_query** - Run Azure Monitor log queries.

---

## Safety Controls for Production Environments

### Principle: Defense in Depth

Never rely on a single layer of protection. Combine multiple safeguards.

### 1. Context-Based Restrictions

Set the Kubernetes context and Terraform workspace explicitly to prevent accidental
operations against the wrong environment:

```json
{
  "env": {
    "K8S_CONTEXT": "staging-cluster",
    "TF_WORKSPACE": "staging"
  }
}
```

### 2. Read-Only Profiles

Create separate MCP configurations for read-only and read-write access:

```
mcp-configs/
  production-readonly.json    # list, describe, logs only
  staging-readwrite.json      # full access for staging
```

### 3. Approval Gates

For destructive operations, require explicit confirmation:

- Terraform apply must show the plan output and receive user confirmation.
- Kubernetes delete operations should list affected resources first.
- Scaling to zero requires double confirmation with resource name.

### 4. Namespace and Resource Restrictions

Limit MCP servers to specific namespaces or resource types:

```json
{
  "env": {
    "K8S_NAMESPACE": "my-team-namespace",
    "K8S_ALLOWED_OPERATIONS": "get,list,logs,describe"
  }
}
```

### 5. Audit Logging

Enable logging for all MCP operations against infrastructure:

- Log every command with timestamp, user, resource, and operation.
- Send logs to a centralized system (CloudWatch, Stackdriver, Datadog).
- Set up alerts for unusual patterns (bulk deletes, off-hours changes).

### 6. Blast Radius Limits

- Set maximum replica counts for scale operations.
- Restrict Terraform apply to specific resource types per configuration.
- Block `kubectl delete namespace` entirely.
- Require labels or annotations on resources before modification.
