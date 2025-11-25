resource "aws_ecs_service" "api" {
  name            = "${var.cluster_name}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"
  force_new_deployment = true

  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100
  
  network_configuration {
    subnets          = var.public_subnet_ids
    assign_public_ip = true
    security_groups  = [var.fargate_sg_id]
  }

  # Register with Cloud Map for service discovery
  service_registries {
    registry_arn = aws_service_discovery_service.api.arn
    port         = var.api_container_port
  }
}

resource "aws_ecs_service" "websocket" {
  name            = "${var.cluster_name}-websocket"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.websocket.arn
  desired_count   = var.websocket_desired_count
  launch_type     = "FARGATE"
  force_new_deployment = true

  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100
  
  network_configuration {
    subnets          = var.public_subnet_ids
    assign_public_ip = true
    security_groups  = [var.fargate_sg_id]
  }

  # Register with Cloud Map for service discovery
  service_registries {
    registry_arn = aws_service_discovery_service.websocket.arn
    port         = var.websocket_container_port
  }
} 