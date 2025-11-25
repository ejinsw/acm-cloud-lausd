# PowerShell deployment script for WebSocket server
# Load environment variables from .env file
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value)
    }
}

$AWS_ACCOUNT_ID = $env:AWS_ACCOUNT_ID
$REGION = "us-west-1"
$REPO_NAME = "lambda-acm-cloud-lausd-websocket-dev"

Write-Host "Logging into ECR..." -ForegroundColor Green
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

Write-Host "Building Docker image for ARM64..." -ForegroundColor Green
docker build --platform linux/arm64 -f Dockerfile.prod -t $REPO_NAME .

Write-Host "Tagging image..." -ForegroundColor Green
docker tag "${REPO_NAME}:latest" "$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"

Write-Host "Pushing image to ECR..." -ForegroundColor Green
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"

Write-Host "Updating ECS service..." -ForegroundColor Green
aws ecs update-service --cluster acmcloud --service acmcloud-websocket --force-new-deployment --region $REGION

Write-Host "Deployment complete!" -ForegroundColor Green

