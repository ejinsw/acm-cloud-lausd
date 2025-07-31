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
