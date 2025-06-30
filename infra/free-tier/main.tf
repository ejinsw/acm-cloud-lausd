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

  # Standard variables
  project_name = var.project_name
  environment  = var.environment

  # VPC variables
  cidr_block = "172.31.0.0/16"
  private_subnet_cidr_zone = ["172.31.0.0/19", "172.31.32.0/19"]
  public_subnet_cidr_zone = ["172.31.64.0/19", "172.31.96.0/19"]
  availability_zones = ["us-west-1a", "us-west-1b"]
}

# ECR Repository for API Lambda
module "ecr_api" {
  source = "./modules/ecr"

  # Standard variables
  project_name  = var.project_name
  environment   = var.environment

  # ECR variables
  function_name = "api"
}

# ECR Repository for WebSocket Lambda
module "ecr_websocket" {
  source = "./modules/ecr"

  # Standard variables
  project_name  = var.project_name
  environment   = var.environment

  # ECR variables
  function_name = "websocket"
}

# RDS Database
module "rds" {
  source = "./modules/rds"

  # Standard variables
  project_name     = var.project_name
  environment      = var.environment

  # RDS variables
  vpc_id           = module.vpc.vpc_id
  subnet_ids       = [module.vpc.private_subnet_id_1, module.vpc.private_subnet_id_2]
  db_username      = var.db_username
  db_password      = var.db_password
  security_group_id = module.vpc.security_group_id
}

# API Lambda Function
module "lambda_api" {
  source = "./modules/lambda"

  # Standard variables
  project_name      = var.project_name
  environment       = var.environment

  # Lambda variables
  function_name     = "api"
  use_container     = true  # Use ECR container
  image_uri         = "${module.ecr_api.repository_url}:latest"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = [module.vpc.public_subnet_id_1, module.vpc.public_subnet_id_2]
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

  # Standard variables
  project_name      = var.project_name
  environment       = var.environment

  # Lambda variables
  function_name     = "websocket"
  use_container     = true  # Use ECR container
  image_uri         = "${module.ecr_websocket.repository_url}:latest"
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = [module.vpc.public_subnet_id_1, module.vpc.public_subnet_id_2]
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

  # Standard variables
  project_name         = var.project_name
  environment          = var.environment

  # API Gateway variables
  lambda_arn           = module.lambda_api.function_arn
  lambda_function_name = module.lambda_api.function_name
}

# WebSocket API Gateway
module "websocket_gateway" {
  source = "./modules/websocket_gateway"

  # Standard variables
  project_name         = var.project_name
  environment          = var.environment

  # API Gateway variables
  lambda_arn           = module.lambda_websocket.function_arn
  lambda_function_name = module.lambda_websocket.function_name
}
