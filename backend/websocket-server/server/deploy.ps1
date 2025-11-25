# PowerShell deployment script for WebSocket server

# Get AWS Account ID from current AWS credentials
Write-Host "Getting AWS Account ID from current credentials..." -ForegroundColor Cyan
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)

if (-not $AWS_ACCOUNT_ID) {
    Write-Host "Error: Could not get AWS Account ID. Make sure AWS CLI is configured!" -ForegroundColor Red
    exit 1
}

$REGION = "us-west-1"
$REPO_NAME = "lambda-acm-cloud-lausd-websocket-dev"

Write-Host "Using AWS Account ID: $AWS_ACCOUNT_ID" -ForegroundColor Cyan
Write-Host "Region: $REGION" -ForegroundColor Cyan
Write-Host "Repository: $REPO_NAME" -ForegroundColor Cyan
Write-Host ""

Write-Host "Logging into ECR..." -ForegroundColor Green
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: ECR login failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Building Docker image for ARM64 (this may take a few minutes)..." -ForegroundColor Green
docker build --no-cache --platform linux/arm64 -f Dockerfile.prod -t $REPO_NAME .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Tagging image..." -ForegroundColor Green
docker tag "${REPO_NAME}:latest" "$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"

Write-Host "Pushing image to ECR..." -ForegroundColor Green
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Updating ECS service..." -ForegroundColor Green
aws ecs update-service --cluster acmcloud --service acmcloud-websocket --force-new-deployment --region $REGION

Write-Host ""
Write-Host "✓ Deployment complete!" -ForegroundColor Green
Write-Host "The websocket service is being updated. Check status with:" -ForegroundColor Yellow
Write-Host "aws ecs describe-services --cluster acmcloud --services acmcloud-websocket --region $REGION" -ForegroundColor Gray

