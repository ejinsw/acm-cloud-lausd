# CI/CD Pipeline Documentation

This repository uses GitHub Actions for continuous integration and deployment, with support for ECR-based Lambda functions.

## Workflow Overview

### Main Pipeline (`main.yml`)
The main CI/CD pipeline runs on every push to `main` and pull request:

1. **Test Frontend** - Lint, test, and build the Next.js frontend
2. **Test API** - Lint, test the API backend with PostgreSQL
3. **Test WebSocket** - Test the WebSocket server
4. **Deploy Infrastructure** - Apply Terraform changes
5. **Build and Push Lambda Images** - Build Docker images and push to ECR
6. **Deploy Lambda Functions** - Update Lambda functions with new images
7. **Deploy Frontend** - Deploy to Vercel
8. **Notify Completion** - Send deployment status

### ECR Lambda Deployment (`deploy-lambda-ecr.yml`)
A dedicated workflow for Lambda deployments that can be:
- **Automatically triggered** on backend code changes
- **Manually triggered** with environment and function selection

## Prerequisites

### Required Secrets
Configure these secrets in your GitHub repository:

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Vercel (for frontend deployment)
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### AWS Permissions
Your AWS credentials need these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "lambda:UpdateFunctionCode",
        "lambda:GetFunction",
        "lambda:WaitForFunctionUpdate"
      ],
      "Resource": "*"
    }
  ]
}
```

## Usage

### Automatic Deployment
The pipeline automatically runs when you push to `main`:

```bash
git push origin main
```

### Manual Lambda Deployment
You can manually trigger Lambda deployments:

1. Go to **Actions** tab in GitHub
2. Select **"Deploy Lambda Functions to ECR"**
3. Click **"Run workflow"**
4. Choose:
   - **Environment**: dev, staging, or prod
   - **Function**: all, api, or websocket

### Environment-Specific Deployments
The workflow supports multiple environments:

- **dev** - Development environment
- **staging** - Staging environment  
- **prod** - Production environment

## Pipeline Stages

### 1. Testing Phase
```yaml
test-frontend:    # Lint, test, build Next.js app
test-api:         # Test API with PostgreSQL
test-websocket:   # Test WebSocket server
```

### 2. Infrastructure Phase
```yaml
deploy-infrastructure:  # Apply Terraform changes
```

### 3. Lambda Deployment Phase
```yaml
build-and-push-images:     # Build and push Docker images to ECR
deploy-lambda-functions:   # Update Lambda functions with new images
verify-deployment:         # Verify successful deployment
```

### 4. Frontend Deployment Phase
```yaml
deploy-frontend:  # Deploy to Vercel
```

## ECR Image Management

### Image Naming Convention
```
lambda-{project-name}-{function}-{environment}:{tag}
```

Examples:
- `lambda-acm-cloud-lausd-api-dev:abc123`
- `lambda-acm-cloud-lausd-websocket-dev:latest`

### Image Tags
- **Commit SHA** - `{github.sha}` for version tracking
- **Latest** - `latest` for easy reference

### Lifecycle Policies
ECR repositories are configured with lifecycle policies:
- Keep last 10 images
- Automatically delete older images
- Reduce storage costs

## Docker Build Optimization

### Multi-Stage Builds
The workflow uses Docker Buildx for:
- **Layer caching** - Faster builds
- **Multi-platform support** - Linux/AMD64
- **Parallel builds** - Matrix strategy

### Build Contexts
- **API**: `backend/api/` with `Dockerfile.lambda`
- **WebSocket**: `backend/websocket-server/server/` with `Dockerfile.lambda`

## Monitoring and Debugging

### Workflow Logs
- Check **Actions** tab for detailed logs
- Each job shows step-by-step execution
- Failed steps are clearly marked

### Lambda Function Status
The verification step checks:
- Function update status
- Image URI configuration
- Deployment success/failure

### Common Issues

#### ECR Repository Not Found
```bash
Error: ECR repository lambda-acm-cloud-lausd-api-dev not found
```
**Solution**: Run `terraform apply` first to create ECR repositories

#### Lambda Update Fails
```bash
Error updating function code
```
**Solution**: Check AWS permissions and function name

#### Docker Build Fails
```bash
Error building Docker image
```
**Solution**: Check Dockerfile syntax and build context

## Security Best Practices

### Secrets Management
- Use GitHub Secrets for sensitive data
- Never commit credentials to code
- Rotate AWS keys regularly

### Image Security
- ECR repositories are private by default
- Automatic vulnerability scanning enabled
- Use specific image tags, not just `latest`

### Network Security
- Lambda functions run in VPC
- Database access through private subnets
- API Gateway with proper authentication

## Cost Optimization

### ECR Storage
- Lifecycle policies delete old images
- Use multi-stage builds to reduce image size
- Consider image compression

### Lambda Execution
- Optimize function code for cold starts
- Use appropriate memory allocation
- Monitor execution time and costs

## Troubleshooting

### Workflow Failures
1. Check the **Actions** tab for error details
2. Verify AWS credentials and permissions
3. Ensure Terraform state is up to date
4. Check ECR repository existence

### Lambda Function Issues
1. Verify image exists in ECR
2. Check function configuration
3. Review CloudWatch logs
4. Test function locally with Docker

### Infrastructure Issues
1. Run `terraform plan` locally
2. Check Terraform state
3. Verify AWS resource limits
4. Review IAM permissions

## Local Development

### Testing Locally
```bash
# Build Lambda images locally
docker build -f backend/api/Dockerfile.lambda backend/api
docker build -f backend/websocket-server/server/Dockerfile.lambda backend/websocket-server/server

# Test with local AWS credentials
aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin {account-id}.dkr.ecr.us-west-1.amazonaws.com
```

### Manual Deployment
```bash
# Use the build script
./scripts/build-and-push-lambda.sh all

# Or deploy individual functions
./scripts/build-and-push-lambda.sh api
./scripts/build-and-push-lambda.sh websocket
```

## Future Enhancements

### Planned Features
- **Blue/Green deployments** for zero-downtime updates
- **Rollback capabilities** for failed deployments
- **Performance monitoring** integration
- **Slack/Teams notifications** for deployment status

### Monitoring Integration
- CloudWatch dashboards
- Custom metrics and alarms
- Performance tracking
- Cost monitoring 