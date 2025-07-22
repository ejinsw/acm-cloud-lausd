########################################################
################# Standard variables ###################
########################################################
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

########################################################
################# VPC variables ########################
########################################################
variable "cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "private_subnet_cidr_zone" {
  description = "CIDR block for the private subnets"
  type        = list(string)
}

variable "public_subnet_cidr_zone" {
  description = "CIDR block for the public subnets"
  type        = list(string)
}

variable "availability_zones" {
  description = "Availability zones for the subnets"
  type        = list(string)
}

variable "db_port" {
  description = "Port for the RDS database"
  type        = number
  default     = 5432
}