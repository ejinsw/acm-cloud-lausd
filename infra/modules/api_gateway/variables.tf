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

variable "alb_listener_arn" {
  description = "ARN of the Application Load Balancer listener"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for VPC Link (should be private subnets)"
  type        = list(string)
} 