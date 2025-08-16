
output "user_pool_id" {
  description = "The ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_client_id" {
  description = "The ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.main.id
}

output "user_pool_client_issuer" {
  description = "The issuer of the Cognito User Pool"
  value       = "https://${aws_cognito_user_pool.main.endpoint}"
}

output "user_pool_client_secret" {
  description = "The secret of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.main.client_secret
}