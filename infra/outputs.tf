output "vpc_id" {
  value = module.vpc.vpc_id
}
output "public_subnet_id_1" {
  value = module.vpc.public_subnet_id_1
}
output "public_subnet_id_2" {
  value = module.vpc.public_subnet_id_2
}
output "private_subnet_id_1" {
  value = module.vpc.private_subnet_id_1
}
output "private_subnet_id_2" {
  value = module.vpc.private_subnet_id_2
}
output "fargate_sg_id" {
  value = module.vpc.fargate_sg_id
}
output "rds_sg_id" {
  value = module.vpc.rds_sg_id
}
output "db_endpoint" {
  value = module.rds.db_endpoint
}
output "db_port" {
  value = module.rds.db_port
}
output "db_name" {
  value = module.rds.db_name
}
output "user_pool_client_id" {
  value = module.cognito.user_pool_client_id
}
output "user_pool_client_issuer" {
  value = module.cognito.user_pool_client_issuer
}
output "user_pool_client_secret" {
  value = module.cognito.user_pool_client_secret
  sensitive = true
}
output "api_ecr_repository_url" {
  value = module.ecr_api.repository_url
}
output "websocket_ecr_repository_url" {
  value = module.ecr_websocket.repository_url
}
output "ecs_cluster_id" {
  value = module.ecs.cluster_id
}
output "alb_dns_name" {
  value = module.ecs.alb_dns_name
}

output "api_gateway_endpoint" {
  description = "API Gateway HTTP API endpoint URL (HTTPS enabled)"
  value       = module.api_gateway.stage_invoke_url
}

output "api_gateway_id" {
  description = "API Gateway HTTP API ID"
  value       = module.api_gateway.api_id
}

output "admin_access_key_id" {
  description = "AWS Access Key ID for Cognito admin operations"
  value       = module.cognito_admin.admin_access_key_id
  sensitive   = true
}

output "admin_secret_access_key" {
  description = "AWS Secret Access Key for Cognito admin operations"
  value       = module.cognito_admin.admin_secret_access_key
  sensitive   = true
}

output "rooms_table_name" {
  description = "DynamoDB table storing room metadata."
  value       = module.dynamodb_dax.rooms_table_name
}

output "room_members_table_name" {
  description = "DynamoDB table storing membership records."
  value       = module.dynamodb_dax.room_members_table_name
}

output "room_messages_table_name" {
  description = "DynamoDB table storing chat messages."
  value       = module.dynamodb_dax.room_messages_table_name
}

output "user_sessions_table_name" {
  description = "DynamoDB table storing user sessions."
  value       = module.dynamodb_dax.user_sessions_table_name
}

output "dax_configuration_endpoint" {
  description = "DAX cluster configuration endpoint for clients."
  value       = module.dynamodb_dax.dax_configuration_endpoint
}

output "dax_cluster_address" {
  description = "Primary address for the DAX cluster."
  value       = module.dynamodb_dax.dax_cluster_address
}
