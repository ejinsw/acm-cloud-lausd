output "cluster_id" {
  value = aws_ecs_cluster.main.id
}
output "cluster_name" {
  value = aws_ecs_cluster.main.name
}
output "cloudmap_api_service_arn" {
  value = aws_service_discovery_service.api.arn
}
output "cloudmap_websocket_service_arn" {
  value = aws_service_discovery_service.websocket.arn
}
output "websocket_service_name" {
  value = aws_ecs_service.websocket.name
} 