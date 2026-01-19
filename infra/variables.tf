variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "acm-cloud-lausd"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "db_username" {
  description = "Username for the RDS instance"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Password for the RDS instance"
  type        = string
  sensitive   = true
}

variable "lambda_memory" {
  description = "Memory allocation for Lambda functions"
  type        = number
  default     = 128 # Free tier optimized
}

variable "lambda_timeout" {
  description = "Timeout for Lambda functions"
  type        = number
  default     = 30 # Free tier optimized
}

variable "api_desired_count" {
  description = "Number of API ECS tasks to run (set to 0 to scale to zero)"
  type        = number
  default     = 1
}

variable "websocket_desired_count" {
  description = "Number of WebSocket ECS tasks to run (set to 0 to scale to zero)"
  type        = number
  default     = 1
}

variable "zoom_client_id" {
  description = "Zoom OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "zoom_client_secret" {
  description = "Zoom OAuth Client Secret"
  type        = string
  sensitive   = true
}

variable "zoom_redirect_uri" {
  description = "Zoom OAuth Redirect URI"
  type        = string
  default     = "https://guzdb7gpyk.execute-api.us-west-1.amazonaws.com/api/zoom/callback"
}

variable "zoom_sdk_key" {
  description = "Zoom SDK Key (optional)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "zoom_sdk_secret" {
  description = "Zoom SDK Secret (optional)"
  type        = string
  default     = ""
  sensitive   = true
} 