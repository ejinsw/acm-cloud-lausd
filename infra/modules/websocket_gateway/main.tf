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

# WebSocket Stage
resource "aws_apigatewayv2_stage" "websocket" {
  api_id      = aws_apigatewayv2_api.websocket.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.websocket_api.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      connectionId   = "$context.connectionId"
      messageId      = "$context.messageId"
    })
  }

  tags = {
    Name        = "${var.project_name}-websocket-stage"
    Environment = var.environment
  }
}

# VPC Link to connect WebSocket API Gateway to Cloud Map
resource "aws_apigatewayv2_vpc_link" "websocket" {
  name               = "${var.project_name}-websocket-vpc-link"
  security_group_ids = var.vpc_link_security_group_ids
  subnet_ids         = var.subnet_ids

  tags = {
    Name        = "${var.project_name}-websocket-vpc-link"
    Environment = var.environment
  }
}

# WebSocket Integration via VPC Link to Cloud Map
resource "aws_apigatewayv2_integration" "websocket" {
  api_id           = aws_apigatewayv2_api.websocket.id
  integration_type = "HTTP_PROXY"

  connection_type        = "VPC_LINK"
  connection_id         = aws_apigatewayv2_vpc_link.websocket.id
  description           = "VPC Link integration to Cloud Map for WebSocket service"
  integration_method    = "POST"
  integration_uri       = var.cloudmap_websocket_service_arn
  payload_format_version = "1.0"
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

# Custom WebSocket Routes
resource "aws_apigatewayv2_route" "message" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "message"
  target    = "integrations/${aws_apigatewayv2_integration.websocket.id}"
}

resource "aws_apigatewayv2_route" "join_room" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "join_room"
  target    = "integrations/${aws_apigatewayv2_integration.websocket.id}"
}

resource "aws_apigatewayv2_route" "leave_room" {
  api_id    = aws_apigatewayv2_api.websocket.id
  route_key = "leave_room"
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