variable "cluster_name" {}
variable "api_image" {}
variable "websocket_image" {}
variable "api_cpu" { default = 256 }
variable "api_memory" { default = 512 }
variable "websocket_cpu" { default = 256 }
variable "websocket_memory" { default = 512 }
variable "api_container_port" { default = 8080 }
variable "websocket_container_port" { default = 9999 }
variable "api_environment" { type = list(object({ name = string, value = string })) }
variable "websocket_environment" { type = list(object({ name = string, value = string })) }
variable "execution_role_arn" {}
variable "task_role_arn" {}
variable "public_subnet_ids" { type = list(string) }
variable "fargate_sg_id" {}
variable "api_desired_count" { default = 0 }
variable "websocket_desired_count" { default = 0 }
variable "vpc_id" {} 