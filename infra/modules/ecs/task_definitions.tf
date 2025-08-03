resource "aws_ecs_task_definition" "api" {
  family                   = "${var.cluster_name}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = var.api_image
      portMappings = [{ containerPort = var.api_container_port }]
      environment = var.api_environment
    }
  ])
}

resource "aws_ecs_task_definition" "websocket" {
  family                   = "${var.cluster_name}-websocket"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.websocket_cpu
  memory                   = var.websocket_memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = "websocket"
      image     = var.websocket_image
      portMappings = [{ containerPort = var.websocket_container_port }]
      environment = var.websocket_environment
    }
  ])
} 