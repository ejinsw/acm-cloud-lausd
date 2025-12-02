resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    allow_headers = ["Content-Type", "Authorization", "X-Requested-With"]
    max_age      = 300
  }

  tags = {
    Name        = "${var.project_name}-api"
    Environment = var.environment
  }
}

resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId        = "$context.requestId"
      ip               = "$context.identity.sourceIp"
      requestTime      = "$context.requestTime"
      httpMethod       = "$context.httpMethod"
      routeKey         = "$context.routeKey"
      status           = "$context.status"
      protocol         = "$context.protocol"
      responseLength   = "$context.responseLength"
      integrationError = "$context.integrationErrorMessage"
    })
  }
}

# VPC Link to connect API Gateway to ALB
resource "aws_apigatewayv2_vpc_link" "alb" {
  name               = "${var.project_name}-vpc-link"
  security_group_ids = var.vpc_link_security_group_ids
  subnet_ids         = var.subnet_ids

  tags = {
    Name        = "${var.project_name}-vpc-link"
    Environment = var.environment
  }
}

# Integration for API service (routes /api/* to Cloud Map)
resource "aws_apigatewayv2_integration" "api" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "HTTP_PROXY"

  connection_type        = "VPC_LINK"
  connection_id         = aws_apigatewayv2_vpc_link.alb.id
  description           = "VPC Link integration to Cloud Map for API service"
  integration_method    = "ANY"
  integration_uri       = var.cloudmap_api_service_arn
  payload_format_version = "1.0"
}

# Integration for WebSocket service (routes /ws/* to Cloud Map)
# Note: HTTP API Gateway doesn't support WebSocket protocol upgrades,
# but can proxy HTTP requests to WebSocket server endpoints
resource "aws_apigatewayv2_integration" "websocket" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "HTTP_PROXY"

  connection_type        = "VPC_LINK"
  connection_id         = aws_apigatewayv2_vpc_link.alb.id
  description           = "VPC Link integration to Cloud Map for WebSocket service"
  integration_method    = "ANY"
  integration_uri       = var.cloudmap_websocket_service_arn
  payload_format_version = "1.0"
}

# Route for API endpoints: /api/{proxy+}
resource "aws_apigatewayv2_route" "api" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}

# Route for WebSocket endpoints: /ws/{proxy+}
# Note: This routes HTTP requests, not WebSocket protocol upgrades
resource "aws_apigatewayv2_route" "websocket" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /ws/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.websocket.id}"
}

# Route for WebSocket root: /ws
resource "aws_apigatewayv2_route" "websocket_root" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /ws"
  target    = "integrations/${aws_apigatewayv2_integration.websocket.id}"
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${aws_apigatewayv2_api.main.name}"
  retention_in_days = 7  # Free tier optimized

  tags = {
    Name        = "${var.project_name}-api-gateway-logs"
    Environment = var.environment
  }
} 