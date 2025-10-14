#!/bin/bash
source .env

aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-west-1.amazonaws.com

# Create a new image
docker build -f Dockerfile.prod -t lambda-acm-cloud-lausd-api-dev .

# Tag the image
docker tag lambda-acm-cloud-lausd-api-dev:latest $AWS_ACCOUNT_ID.dkr.ecr.us-west-1.amazonaws.com/lambda-acm-cloud-lausd-api-dev:latest

# Push the image to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-west-1.amazonaws.com/lambda-acm-cloud-lausd-api-dev:latest