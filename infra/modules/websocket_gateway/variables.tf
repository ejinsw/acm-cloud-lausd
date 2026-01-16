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
  description = "VPC ID for the ALB"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for the ALB"
  type        = list(string)
}

variable "alb_security_group_ids" {
  description = "Security group IDs for the ALB"
  type        = list(string)
}

variable "websocket_port" {
  description = "Port for WebSocket service"
  type        = number
  default     = 9999
}

variable "ecs_service_name" {
  description = "Name of the ECS service for WebSocket"
  type        = string
}

variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
} 