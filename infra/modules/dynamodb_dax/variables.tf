variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}
# DAX variables - commented out to reduce costs (using direct DynamoDB access)
# variable "project_name" {
#   description = "Project prefix for DAX resources"
#   type        = string
#   default     = "acm-cloud-lausd"
# }
#
# variable "dax_vpc_id" {
#   description = "VPC where the optional DAX security group should be created. Leave empty to skip custom networking."
#   type        = string
#   default     = ""
# }
#
# variable "dax_subnet_ids" {
#   description = "Subnet IDs for the DAX subnet group. Provide at least one when dax_vpc_id is set."
#   type        = list(string)
#   default     = []
# }
#
# variable "dax_allowed_security_group_ids" {
#   description = "Security group IDs that should be allowed to reach the DAX cluster on port 8111."
#   type        = list(string)
#   default     = []
# }
#
# variable "dax_allowed_cidr_blocks" {
#   description = "CIDR ranges that should be allowed to reach the DAX cluster on port 8111."
#   type        = list(string)
#   default     = []
# }
#
# variable "dax_node_type" {
#   description = "Instance size for the DAX nodes."
#   type        = string
#   default     = "dax.t3.small"
# }
#
# variable "dax_replication_factor" {
#   description = "Number of nodes in the DAX cluster."
#   type        = number
#   default     = 1
# }
