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

variable "subnet_ids" {
  description = "Subnet IDs for the RDS instance"
  type        = list(string)
}

variable "vpc_id" {
  description = "VPC ID for the RDS instance"
  type        = string
}

variable "security_group_id" {
  description = "The security group ID for the RDS instance (should be the RDS SG from VPC module)"
  type        = string
}