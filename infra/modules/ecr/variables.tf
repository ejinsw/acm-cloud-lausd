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
  description = "Name of the Lambda function for this ECR repository"
  type        = string
} 