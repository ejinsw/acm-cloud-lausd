# ACM Cloud LAUSD Infrastructure

This directory contains the Terraform configuration for the ACM Cloud LAUSD infrastructure.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) (v1.0.0 or later)
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- S3 bucket for Terraform state (create manually)
- DynamoDB table for Terraform state locking (create manually)

## Infrastructure Components

- VPC with public and private subnets
- ECS Fargate cluster for container orchestration
- RDS PostgreSQL database
- ECR repositories for Docker images
- Application Load Balancer
- CloudWatch Log Groups
- IAM roles and policies

## Directory Structure

```
infrastructure/
├── main.tf                 # Main Terraform configuration
├── variables.tf            # Variable definitions
├── terraform.tfvars        # Environment-specific variables
├── modules/               # Terraform modules
│   ├── vpc/              # VPC module
│   ├── ecs/              # ECS module
│   ├── rds/              # RDS module
│   ├── ecr/              # ECR module
│   └── alb/              # ALB module
└── README.md             # This file
```

## Setup Instructions

1. Create an S3 bucket for Terraform state:
   ```bash
   aws s3api create-bucket \
     --bucket acm-cloud-lausd-terraform-state \
     --region us-west-2 \
     --create-bucket-configuration LocationConstraint=us-west-2
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

## Managing the Infrastructure

- To update the infrastructure:
  ```bash
  terraform plan
  terraform apply
  ```

- To destroy the infrastructure:
  ```bash
  terraform destroy
  ```

## Security Notes

- Never commit sensitive values like passwords to version control
- Use AWS Secrets Manager or Parameter Store for sensitive values in production
- Regularly rotate database credentials
- Follow the principle of least privilege for IAM roles

## Cost Considerations

- The infrastructure uses Fargate for serverless container execution
- RDS instance size can be adjusted based on needs
- Consider using reserved instances for production workloads
- Monitor CloudWatch metrics for cost optimization

## Troubleshooting

- Check CloudWatch Logs for application issues
- Verify security group rules if connectivity issues occur
- Ensure IAM roles have correct permissions
- Check ECS task definitions for configuration issues 