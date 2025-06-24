terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket       = "acm-cloud-lausd-free-tier"
    key          = "terraform.tfstate"
    region       = "us-west-1"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
}

# ECR Repository for API Lambda
module "ecr_api" {
  source = "./modules/ecr"

  project_name  = var.project_name
  environment   = var.environment
  function_name = "api"
}

# ECR Repository for WebSocket Lambda
module "ecr_websocket" {
  source = "./modules/ecr"

  project_name  = var.project_name
  environment   = var.environment
  function_name = "websocket"
}

# RDS Database (Free Tier)
module "rds" {
  source = "./modules/rds"

  project_name     = var.project_name
  environment      = var.environment
  vpc_id           = module.vpc.vpc_id
  subnet_ids       = module.vpc.private_subnet_ids
  db_username      = var.db_username
  db_password      = var.db_password
  security_group_id = module.vpc.security_group_id
}

# API Lambda Function
module "lambda_api" {
  source = "./modules/lambda"

  project_name      = var.project_name
  environment       = var.environment
  function_name     = "api"
  use_container     = true  # Use ECR container
  image_uri         = "${module.ecr_api.repository_url}:latest"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  security_group_id = module.vpc.security_group_id
  db_username       = var.db_username
  db_password       = var.db_password
  db_name           = "acmcloud"
  db_host           = module.rds.db_endpoint
  lambda_timeout    = var.lambda_timeout
  lambda_memory     = var.lambda_memory

  depends_on = [module.rds, module.ecr_api]
}

# WebSocket Lambda Function
module "lambda_websocket" {
  source = "./modules/lambda"

  project_name      = var.project_name
  environment       = var.environment
  function_name     = "websocket"
  use_container     = true  # Use ECR container
  image_uri         = "${module.ecr_websocket.repository_url}:latest"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  security_group_id = module.vpc.security_group_id
  db_username       = var.db_username
  db_password       = var.db_password
  db_name           = "acmcloud"
  db_host           = module.rds.db_endpoint
  lambda_timeout    = var.lambda_timeout
  lambda_memory     = var.lambda_memory

  depends_on = [module.rds, module.ecr_websocket]
}

# API Gateway
module "api_gateway" {
  source = "./modules/api_gateway"

  project_name         = var.project_name
  environment          = var.environment
  lambda_arn           = module.lambda_api.function_arn
  lambda_function_name = module.lambda_api.function_name
}

# WebSocket API Gateway
module "websocket_gateway" {
  source = "./modules/websocket_gateway"

  project_name         = var.project_name
  environment          = var.environment
  lambda_arn           = module.lambda_websocket.function_arn
  lambda_function_name = module.lambda_websocket.function_name
}
