output "cluster_id" {
  value = aws_ecs_cluster.main.id
}
output "cloudmap_api_service_arn" {
  value = aws_service_discovery_service.api.arn
}
output "cloudmap_websocket_service_arn" {
  value = aws_service_discovery_service.websocket.arn
} 