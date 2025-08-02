output "websocket_api_id" {
  description = "The ID of the WebSocket API Gateway"
  value       = aws_apigatewayv2_api.websocket.id
}

output "websocket_api_endpoint" {
  description = "The WebSocket API Gateway endpoint URL"
  value       = aws_apigatewayv2_stage.websocket.invoke_url
}

output "websocket_api_arn" {
  description = "The ARN of the WebSocket API Gateway"
  value       = aws_apigatewayv2_api.websocket.arn
}

output "websocket_execution_arn" {
  description = "The execution ARN of the WebSocket API Gateway"
  value       = aws_apigatewayv2_api.websocket.execution_arn
} 