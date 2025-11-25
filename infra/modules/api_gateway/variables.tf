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

variable "vpc_id" {
  description = "VPC ID for VPC Link"
  type        = string
}

variable "cloudmap_api_service_arn" {
  description = "ARN of the Cloud Map service for API"
  type        = string
}

variable "cloudmap_websocket_service_arn" {
  description = "ARN of the Cloud Map service for WebSocket"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for VPC Link (should be private subnets)"
  type        = list(string)
}

variable "vpc_link_security_group_ids" {
  description = "Security group IDs for VPC Link"
  type        = list(string)
  default     = []
} 