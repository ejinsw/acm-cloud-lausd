locals {
  standard_tags = {
    Environment = var.environment
  }

  base_name = "${var.environment}-${var.project_name}"
} 