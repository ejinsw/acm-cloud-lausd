# ACM Cloud LAUSD Free Tier Infrastructure

This directory contains a Terraform configuration optimized for AWS Free Tier usage.

## Free Tier Components

1. **RDS PostgreSQL (Free for 12 months)**
   - db.t3.micro instance
   - 20GB storage
   - Single AZ
   - Cost: $0/month (Free tier)

2. **Lambda Functions**
   - 1M free requests per month
   - 400,000 GB-seconds of compute time
   - Cost: $0/month (Free tier)

3. **API Gateway**
   - 1M free API calls per month
   - Cost: $0/month (Free tier)

4. **CloudWatch Logs**
   - 5GB of log data ingestion
   - 5GB of log data storage
   - Cost: $0/month (Free tier)

## Monthly Cost Breakdown (Free Tier)

1. **RDS PostgreSQL**
   - Instance: $0 (Free tier)
   - Storage: $0 (Free tier)
   - Total: $0/month

2. **Lambda**
   - Requests: $0 (Free tier)
   - Compute: $0 (Free tier)
   - Total: $0/month

3. **API Gateway**
   - Requests: $0 (Free tier)
   - Data Transfer: $0 (Free tier)
   - Total: $0/month

4. **CloudWatch**
   - Logs: $0 (Free tier)
   - Metrics: $0 (Free tier)
   - Total: $0/month

**Total Monthly Cost: $0** (During Free Tier period)

## After Free Tier Expires

After the 12-month free tier period, estimated costs would be:

1. **RDS PostgreSQL**
   - db.t3.micro: $13.68/month
   - 20GB storage: $2.30/month
   - Total: ~$16/month

2. **Lambda**
   - 1M requests: $0.20
   - Compute time: ~$0.50
   - Total: ~$0.70/month

3. **API Gateway**
   - 1M requests: $3.50
   - Data transfer: ~$0.09/GB
   - Total: ~$4/month

4. **CloudWatch**
   - Logs: ~$1-2/month
   - Metrics: ~$0.30/month
   - Total: ~$2/month

**Total Monthly Cost After Free Tier: ~$23/month**

## Setup Instructions

1. Create an S3 bucket for Terraform state:
   ```bash
   aws s3api create-bucket \
     --bucket acm-cloud-lausd-free-tier \
     --region us-west-1 \
     --create-bucket-configuration LocationConstraint=us-west-1
   ```

2. Create a DynamoDB table for state locking:
   ```bash
   aws dynamodb create-table \
     --table-name terraform-state-lock \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
   ```

3. Update `terraform.tfvars` with your specific values:
   - Replace `db_password` with a secure password
   - Adjust other variables as needed

4. Initialize Terraform:
   ```bash
   terraform init
   ```

5. Review the planned changes:
   ```bash
   terraform plan
   ```

6. Apply the configuration:
   ```bash
   terraform apply
   ```

## Cost Optimization Tips

1. **Monitor Usage**
   - Set up CloudWatch alarms for usage thresholds
   - Monitor Lambda execution times
   - Track API Gateway request counts

2. **Optimize Lambda**
   - Use appropriate memory settings
   - Implement proper error handling
   - Use connection pooling for database connections

3. **Database Optimization**
   - Implement proper indexing
   - Use connection pooling
   - Monitor query performance

4. **API Gateway**
   - Use caching where appropriate
   - Implement proper error handling
   - Monitor request patterns

## Security Notes

- Never commit sensitive values to version control
- Use AWS Secrets Manager for sensitive values
- Implement proper IAM roles and policies
- Enable VPC endpoints for private access
- Use security groups to restrict access 