variable "user_pool_name" {
  description = "Name of the Cognito User Pool"
  type        = string
}

variable "user_pool_client_name" {
  description = "Name of the Cognito User Pool Client"
  type        = string
}

variable "create_identity_pool" {
  description = "Whether to create an Identity Pool"
  type        = bool
  default     = false
}

variable "frontend_url" {
  description = "The URL of the frontend"
  type        = string
}