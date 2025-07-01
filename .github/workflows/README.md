# GitHub Actions Workflows

This directory contains modular GitHub Actions workflows for the ACM Cloud LAUSD project. The workflows are designed to be focused, reusable, and maintainable.

## Workflow Structure 

### 1. `main.yml` - CI/CD Pipeline Orchestrator
- **Purpose**: Entry point for all CI/CD activities
- **Triggers**: Push to any branch, pull requests to main, merge groups
- **Function**: Lightweight orchestrator that logs pipeline start and can be extended with additional orchestration logic

### 2. `test.yml` - Testing Workflow
- **Purpose**: Run all tests for frontend, API, and WebSocket components
- **Triggers**: Push to any branch, pull requests to main, merge groups
- **Jobs**:
  - `test-frontend`: Lint, test, and build the Next.js frontend
  - `test-api`: Lint and test the API with PostgreSQL service
  - `test-websocket`: Test the WebSocket server

### 3. `build-and-deploy.yml` - Build and Deploy Workflow
- **Purpose**: Build and push Lambda container images to ECR
- **Triggers**: Runs after successful completion of the Test workflow on main branch
- **Jobs**:
  - `build-and-push-lambda-images`: Build and push API and WebSocket Lambda images
  - `notify-deployment`: Send deployment success notifications

### 4. `terraform-deploy.yml` - Infrastructure Deployment
- **Purpose**: Deploy infrastructure using Terraform
- **Triggers**: Manual trigger with workflow_dispatch only
- **Jobs**:
  - `terraform-plan`: Plan Terraform changes
  - `terraform-apply`: Apply Terraform changes (automatic on main branch)
  - `terraform-destroy`: Destroy infrastructure (manual only)
  - `notify-terraform`: Send Terraform completion notifications

## Workflow Dependencies

```
main.yml (orchestrator)
    ↓
test.yml (runs on all branches/PRs)
    ↓ (only on main branch)
build-and-deploy.yml

terraform-deploy.yml (manual only)
```

## Manual Workflow Triggers

### Terraform Deployment
You can manually trigger Terraform deployments using the workflow_dispatch event:

1. Go to the Actions tab in GitHub
2. Select "Terraform Deploy" workflow
3. Click "Run workflow"
4. Choose:
   - **Environment**: `free-tier` or `full-tier`
   - **Action**: `plan`, `apply`, or `destroy`

## Environment Variables

### Required Secrets
- `AWS_ACCESS_KEY_ID`: AWS access key for ECR and Terraform operations
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for ECR and Terraform operations

### Environment Variables
- `AWS_REGION`: AWS region (default: us-west-1)
- `PROJECT_NAME`: Project name (default: acm-cloud-lausd)
- `ENVIRONMENT`: Environment name (default: dev)
- `NODE_VERSION`: Node.js version (default: 18)

## Terraform Variables

The Terraform workflows automatically set these variables:
- `TF_VAR_project_name`: Set to `PROJECT_NAME`
- `TF_VAR_environment`: Set to the selected environment (free-tier/full-tier)

## Workflow Features

### Parallel Execution
- Frontend, API, and WebSocket tests run in parallel
- Build and push operations for different Lambda images run sequentially

### Conditional Execution
- Build and deploy workflows only run on main branch
- Terraform workflows require manual trigger
- Terraform destroy requires manual trigger

### Error Handling
- Each workflow has proper error handling and notifications
- Failed workflows don't trigger dependent workflows
- Comprehensive logging for debugging

### Caching
- npm dependencies are cached for faster builds
- Terraform plan artifacts are preserved between jobs

## Best Practices

1. **Modularity**: Each workflow has a single responsibility
2. **Reusability**: Workflows can be triggered independently
3. **Security**: Sensitive operations require manual approval
4. **Monitoring**: All workflows provide clear success/failure notifications
5. **Performance**: Parallel execution where possible, caching for speed

## Troubleshooting

### Common Issues

1. **Workflow not triggering**: Check branch protection rules and required status checks
2. **Terraform plan fails**: Verify Terraform configuration and AWS credentials
3. **Build fails**: Check Dockerfile syntax and dependencies
4. **Tests fail**: Verify test environment setup and database connectivity

### Debugging

- Check workflow logs in the Actions tab
- Verify environment variables and secrets are set correctly
- Ensure AWS credentials have necessary permissions
- Review Terraform plan output for infrastructure issues

## Security Best Practices

1. **Secrets Management**
   - Never commit secrets to code
   - Use GitHub Secrets for sensitive data
   - Rotate secrets regularly

2. **AWS Permissions**
   - Use least privilege principle
   - Create dedicated IAM user for CI/CD
   - Limit permissions to necessary resources

3. **Vercel Security**
   - Use project-specific tokens
   - Limit token permissions
   - Monitor deployment logs

## Monitoring

### GitHub Actions
- Monitor workflow runs in Actions tab
- Set up notifications for failed deployments
- Review logs for performance issues

### AWS Resources
- Monitor Lambda function metrics
- Check RDS performance
- Review API Gateway logs

### Vercel
- Monitor deployment performance
- Check build logs
- Review analytics

## Next Steps

1. Set up the required secrets
2. Test the pipeline with a small change
3. Configure monitoring and alerts
4. Set up staging environment
5. Implement rollback procedures 