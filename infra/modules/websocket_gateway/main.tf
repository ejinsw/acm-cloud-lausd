# Application Load Balancer for WebSocket service (public-facing)
resource "aws_lb" "websocket" {
  name               = "${var.project_name}-ws-alb"
  internal           = false  # Public ALB
  load_balancer_type = "application"
  security_groups    = var.alb_security_group_ids
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false
  enable_http2              = true

  tags = {
    Name        = "${var.project_name}-websocket-alb"
    Environment = var.environment
  }
}

# Target Group for WebSocket service
resource "aws_lb_target_group" "websocket" {
  name        = "${var.project_name}-ws-tg"
  port        = var.websocket_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200-499"
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }

  stickiness {
    enabled         = true
    type            = "lb_cookie"
    cookie_duration = 86400
  }

  deregistration_delay = 30

  tags = {
    Name        = "${var.project_name}-websocket-tg"
    Environment = var.environment
  }
}

# ALB Listener for WebSocket
resource "aws_lb_listener" "websocket" {
  load_balancer_arn = aws_lb.websocket.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.websocket.arn
  }
}

# Note: ECS tasks will automatically register with the target group
# when the ECS service is created with the load_balancer block

# WebSocket API Gateway
resource "aws_apigatewayv2_api" "websocket" {
  name                       = "${var.project_name}-websocket-api"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"

  tags = {
    Name        = "${var.project_name}-websocket-api"
    Environment = var.environment
  }
}

# WebSocket Stage (no path, flat URL)
resource "aws_apigatewayv2_stage" "websocket" {
  api_id      = aws_apigatewayv2_api.websocket.id
  name        = "$default"
  auto_deploy = true

  tags = {
    Name        = "${var.project_name}-websocket-stage"
    Environment = var.environment
  }
}

# WebSocket Integration to public ALB
# Note: For WebSocket API Gateway, we need HTTP_PROXY with proper WebSocket upgrade support
resource "aws_apigatewayv2_integration" "websocket" {
  api_id             = aws_apigatewayv2_api.websocket.id
  integration_type   = "HTTP_PROXY"
  integration_uri    = "http://${aws_lb.websocket.dns_name}"
  integration_method = "ANY"
  
  # Required for WebSocket connections
  connection_type = "INTERNET"
  
  # Pass through the request as-is to support WebSocket upgrade
  passthrough_behavior = "WHEN_NO_MATCH"
  
  # Increase timeout for WebSocket connections (max 29 seconds for integration timeout)
  timeout_milliseconds = 29000

  depends_on = [aws_lb.websocket]
}

# WebSocket Routes
resource "aws_apigatewayv2_route" "connect" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.websocket.id}"
}

resource "aws_apigatewayv2_route" "disconnect" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.websocket.id}"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.websocket.id}"
}

# CloudWatch Log Group for WebSocket API Gateway
resource "aws_cloudwatch_log_group" "websocket_api" {
  name              = "/aws/apigateway/${aws_apigatewayv2_api.websocket.name}"
  retention_in_days = 7  # Free tier optimized

  tags = {
    Name        = "${var.project_name}-websocket-api-logs"
    Environment = var.environment
  }
} 