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

variable "lambda_arn" {
  description = "ARN of the WebSocket Lambda function"
  type        = string
}

variable "lambda_function_name" {
  description = "Name of the WebSocket Lambda function"
  type        = string
} 