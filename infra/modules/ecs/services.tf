resource "aws_ecs_service" "api" {
  name            = "${var.cluster_name}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = var.public_subnet_ids
    assign_public_ip = true
    security_groups  = [var.fargate_sg_id]
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = var.api_container_port
  }
}

resource "aws_ecs_service" "websocket" {
  name            = "${var.cluster_name}-websocket"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.websocket.arn
  desired_count   = var.websocket_desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = var.public_subnet_ids
    assign_public_ip = true
    security_groups  = [var.fargate_sg_id]
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.websocket.arn
    container_name   = "websocket"
    container_port   = var.websocket_container_port
  }
} 