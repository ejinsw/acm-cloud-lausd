output "websocket_api_id" {
  description = "The ID of the WebSocket API Gateway"
  value       = aws_apigatewayv2_api.websocket.id
}

output "websocket_api_endpoint" {
  description = "The WebSocket API Gateway endpoint URL (wss://) - includes /$default stage"
  value       = aws_apigatewayv2_stage.websocket.invoke_url
}

output "websocket_cloudfront_domain" {
  description = "CloudFront domain for WebSocket connections (wss://)"
  value       = "wss://${aws_cloudfront_distribution.websocket.domain_name}"
}

output "websocket_api_arn" {
  description = "The ARN of the WebSocket API Gateway"
  value       = aws_apigatewayv2_api.websocket.arn
}

output "websocket_execution_arn" {
  description = "The execution ARN of the WebSocket API Gateway"
  value       = aws_apigatewayv2_api.websocket.execution_arn
}

output "websocket_alb_dns" {
  description = "DNS name of the WebSocket ALB"
  value       = aws_lb.websocket.dns_name
}

output "websocket_target_group_arn" {
  description = "ARN of the WebSocket target group"
  value       = aws_lb_target_group.websocket.arn
} 