locals {
  name = var.project_name
  environment = var.environment
  common_tags = {
    Name        = "${local.name}-${local.environment}"
    Environment = local.environment
    Project     = local.name
  }
}

data "aws_ecr_authorization_token" "token" {}

# Create a single ECR repository
resource "aws_ecr_repository" "repository" {
  name                 = "lambda-${local.name}-${var.function_name}-${local.environment}"
  image_tag_mutability = "MUTABLE"
  
  tags = merge(local.common_tags, {
    Function = var.function_name
  })
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  lifecycle {
    ignore_changes = all
  }
}

# ECR Lifecycle Policy
resource "aws_ecr_lifecycle_policy" "lifecycle_policy" {
  repository = aws_ecr_repository.repository.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
} 