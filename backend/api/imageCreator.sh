#!/bin/bash
source .env

aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-west-1.amazonaws.com

# Create a new image
docker build --platform linux/arm64 -f Dockerfile.prod -t lambda-acm-cloud-lausd-api-dev .

# Tag the image
docker tag lambda-acm-cloud-lausd-api-dev:latest $AWS_ACCOUNT_ID.dkr.ecr.us-west-1.amazonaws.com/lambda-acm-cloud-lausd-api-dev:latest

# Push the image to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-west-1.amazonaws.com/lambda-acm-cloud-lausd-api-dev:latest

# Update the service
aws ecs update-service --cluster acmcloud --service acmcloud-api --force-new-deployment --region us-west-1