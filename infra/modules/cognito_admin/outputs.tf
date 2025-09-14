output "admin_user_arn" {
  description = "ARN of the Cognito admin IAM user"
  value       = aws_iam_user.cognito_admin_user.arn
}

output "admin_role_arn" {
  description = "ARN of the Cognito admin IAM role"
  value       = aws_iam_role.cognito_admin_role.arn
}

output "admin_access_key_id" {
  description = "Access key ID for Cognito admin operations"
  value       = aws_iam_access_key.cognito_admin_access_key.id
  sensitive   = true
}

output "admin_secret_access_key" {
  description = "Secret access key for Cognito admin operations"
  value       = aws_iam_access_key.cognito_admin_access_key.secret
  sensitive   = true
}

output "ssm_access_key_parameter" {
  description = "SSM parameter name for access key ID"
  value       = aws_ssm_parameter.cognito_admin_access_key_id.name
}

output "ssm_secret_key_parameter" {
  description = "SSM parameter name for secret access key"
  value       = aws_ssm_parameter.cognito_admin_secret_access_key.name
}
