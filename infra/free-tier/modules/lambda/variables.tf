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

variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "use_container" {
  description = "Whether to use ECR container or ZIP file"
  type        = bool
  default     = false
}

variable "image_uri" {
  description = "ECR image URI for the Lambda function (required when use_container = true)"
  type        = string
  default     = ""
}

variable "lambda_code" {
  description = "JavaScript code for the Lambda function (used when use_container = false)"
  type        = string
  default     = ""
}

variable "vpc_id" {
  description = "VPC ID for the Lambda function"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for the Lambda function"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for the Lambda function"
  type        = string
}

variable "lambda_timeout" {
  description = "Timeout for the Lambda function in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory" {
  description = "Memory allocation for the Lambda function in MB"
  type        = number
  default     = 128
}

variable "environment_variables" {
  description = "Environment variables for the Lambda function"
  type        = map(string)
  default     = {}
}
