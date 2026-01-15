terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket       = "acm-cloud-lausd-terraform-state"
    key          = "terraform.tfstate"
    region       = "us-west-1"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  session_idle_timeout_ms = 30 * 60 * 1000
  max_session_ttl_ms      = 24 * 60 * 60 * 1000
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"

  # Standard variables
  project_name = var.project_name
  environment  = var.environment

  # VPC variables
  cidr_block               = "10.0.0.0/16"
  private_subnet_cidr_zone = ["10.0.0.0/19", "10.0.32.0/19"]
  public_subnet_cidr_zone  = ["10.0.64.0/19", "10.0.96.0/19"]
  availability_zones       = ["us-west-1a", "us-west-1c"]
}

# ECR Repository for API Lambda
module "ecr_api" {
  source = "./modules/ecr"

  # Standard variables
  project_name = var.project_name
  environment  = var.environment

  # ECR variables
  function_name = "api"
}

# ECR Repository for WebSocket Lambda
module "ecr_websocket" {
  source = "./modules/ecr"

  # Standard variables
  project_name = var.project_name
  environment  = var.environment

  # ECR variables
  function_name = "websocket"
}

# RDS Database
module "rds" {
  source = "./modules/rds"

  # Standard variables
  project_name = var.project_name
  environment  = var.environment

  # RDS variables
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = [module.vpc.private_subnet_id_1, module.vpc.private_subnet_id_2]
  db_username       = var.db_username
  db_password       = var.db_password
  security_group_id = module.vpc.security_group_id

  depends_on = [module.vpc]
}

# Cognito User Pool and Client
module "cognito" {
  source = "./modules/cognito"

  # Cognito variables
  user_pool_name        = "lausd-cognito-pool"
  user_pool_client_name = "lausd-cognito-app"
  frontend_url          = "https://acm-cloud-lausd.vercel.app/"
}

# Cognito Admin IAM Setup
module "cognito_admin" {
  source = "./modules/cognito_admin"

  environment    = var.environment
  user_pool_arn  = module.cognito.user_pool_arn
  user_pool_id   = module.cognito.user_pool_id

  depends_on = [module.cognito]
}

# --- Remove Lambda and API Gateway modules ---
# module "lambda_api" { ... }
# module "lambda_websocket" { ... }
# module "api_gateway" { ... }
# module "websocket_gateway" { ... }

# --- Add ECS Fargate module ---
module "ecs" {
  source                = "./modules/ecs"
  cluster_name          = "acmcloud"
  api_image             = "${module.ecr_api.repository_url}:latest"
  websocket_image       = "${module.ecr_websocket.repository_url}:latest"
  api_environment       = [
    { name = "NODE_ENV", value = var.environment },
    { name = "DATABASE_URL", value = "postgresql://${var.db_username}:${var.db_password}@${module.rds.db_endpoint}/acmcloud" },
    { name = "NEXT_PUBLIC_COGNITO_REGION", value = "us-west-1" },
    { name = "NEXT_PUBLIC_COGNITO_CLIENT_SECRET", value = module.cognito.user_pool_client_secret },
    { name = "NEXT_PUBLIC_COGNITO_CLIENT_ISSUE", value = module.cognito.user_pool_client_issuer },
    { name = "NEXT_PUBLIC_COGNITO_CLIENT_ID", value = module.cognito.user_pool_client_id },
    { name = "COGNITO_USER_POOL_ID", value = module.cognito.user_pool_id },
    { name = "AWS_REGION", value = "us-west-1" },
    { name = "AWS_ACCESS_KEY_ID", value = module.cognito_admin.admin_access_key_id },
    { name = "AWS_SECRET_ACCESS_KEY", value = module.cognito_admin.admin_secret_access_key }
  ]
  websocket_environment = [
    { name = "NODE_ENV", value = var.environment },
    { name = "PORT", value = "9999" },
    { name = "AWS_REGION", value = var.aws_region },
    { name = "ROOMS_TABLE_NAME", value = module.dynamodb_dax.rooms_table_name },
    { name = "ROOM_MEMBERS_TABLE_NAME", value = module.dynamodb_dax.room_members_table_name },
    { name = "ROOM_MESSAGES_TABLE_NAME", value = module.dynamodb_dax.room_messages_table_name },
    { name = "USER_SESSIONS_TABLE_NAME", value = module.dynamodb_dax.user_sessions_table_name },
    # { name = "DAX_ENDPOINT", value = module.dynamodb_dax.dax_configuration_endpoint },
    { name = "SESSION_IDLE_TIMEOUT_MS", value = tostring(local.session_idle_timeout_ms) },
    { name = "MAX_SESSION_TTL_MS", value = tostring(local.max_session_ttl_ms) }
  ]
  execution_role_arn         = aws_iam_role.ecs_execution_role.arn
  task_role_arn              = aws_iam_role.ecs_task_role.arn
  public_subnet_ids          = [module.vpc.public_subnet_id_1, module.vpc.public_subnet_id_2]
  fargate_sg_id              = module.vpc.fargate_sg_id
  alb_sg_id                  = module.vpc.alb_sg_id
  api_desired_count          = var.api_desired_count
  websocket_desired_count    = var.websocket_desired_count
  vpc_id                 = module.vpc.vpc_id
}




# FOR DAEHOON AND SID
module "dynamodb_dax" {
  source = "./modules/dynamodb_dax"
  environment = var.environment
  # DAX configuration - commented out to reduce costs (using direct DynamoDB access)
  # dax_vpc_id  = module.vpc.vpc_id
  # dax_subnet_ids = [
  #   module.vpc.private_subnet_id_1,
  #   module.vpc.private_subnet_id_2
  # ]
  # dax_allowed_security_group_ids = [module.vpc.fargate_sg_id]

  depends_on = [module.vpc]
}
# END
