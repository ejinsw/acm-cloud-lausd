variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "user_pool_arn" {
  description = "ARN of the Cognito User Pool"
  type        = string
}

variable "user_pool_id" {
  description = "ID of the Cognito User Pool"
  type        = string
}
