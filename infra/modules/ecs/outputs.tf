output "cluster_id" {
  value = aws_ecs_cluster.main.id
}
output "alb_dns_name" {
  value = aws_lb.main.dns_name
} 