# CI/CD Pipeline Setup Guide

This guide explains how to set up the CI/CD pipeline for the ACM Cloud LAUSD project.

## Overview

The CI/CD pipeline consists of the following stages:

1. **Testing**: Runs tests for both frontend and backend
2. **Infrastructure Deployment**: Deploys AWS infrastructure using Terraform
3. **Frontend Deployment**: Deploys the Next.js app to Vercel
4. **Backend Deployment**: Updates the Lambda function
5. **Notification**: Sends deployment status notifications

## Required Secrets

You need to set up the following secrets in your GitHub repository:

### AWS Secrets
1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secrets:

```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

### Vercel Secrets
1. Get your Vercel token:
   - Go to Vercel dashboard
   - Navigate to Settings > Tokens
   - Create a new token

2. Get your Vercel project details:
   - Go to your project in Vercel
   - Navigate to Settings > General
   - Copy the Project ID and Org ID

3. Add the following secrets:
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

## Pipeline Workflow

### 1. Testing Stage
- **Frontend Tests**: Runs linting, tests, and build
- **Backend Tests**: Runs tests with PostgreSQL service container
- Both jobs run in parallel for faster feedback

### 2. Infrastructure Deployment
- Only runs on `main` branch
- Uses Terraform to deploy AWS infrastructure
- Creates/updates:
  - RDS PostgreSQL database
  - Lambda functions
  - API Gateway
  - VPC and security groups

### 3. Frontend Deployment
- Deploys to Vercel
- Uses the Vercel GitHub Action
- Automatically handles:
  - Build optimization
  - CDN distribution
  - SSL certificates

### 4. Backend Deployment
- Updates Lambda function code
- Creates deployment package
- Updates function without downtime

### 5. Notification
- Sends deployment status
- Provides URLs for frontend and backend

## Branch Strategy

- **main**: Production deployments
- **develop**: Development deployments
- **feature branches**: Only run tests, no deployment

## Environment Variables

The pipeline uses the following environment variables:
- `AWS_REGION`: us-west-1
- `NODE_VERSION`: 18

## Cost Considerations

### GitHub Actions
- Free tier: 2,000 minutes/month
- Our pipeline uses approximately:
  - Testing: ~10 minutes per run
  - Deployment: ~15 minutes per run
  - Total: ~25 minutes per deployment

### AWS Costs
- Infrastructure deployment is free
- Only pay for the resources created
- Lambda deployments are free

## Troubleshooting

### Common Issues

1. **AWS Credentials Error**
   - Verify AWS access keys are correct
   - Ensure IAM user has necessary permissions

2. **Vercel Deployment Failed**
   - Check Vercel token is valid
   - Verify project ID and org ID
   - Ensure Vercel project is connected to GitHub

3. **Terraform Plan Failed**
   - Check Terraform state is accessible
   - Verify S3 bucket and DynamoDB table exist
   - Review Terraform configuration

### Debugging Steps

1. Check GitHub Actions logs
2. Verify secrets are set correctly
3. Test AWS credentials locally
4. Check Vercel project settings

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