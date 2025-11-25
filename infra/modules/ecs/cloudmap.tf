# Cloud Map Namespace for Service Discovery
resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "${var.cluster_name}.local"
  description = "Service discovery namespace for ${var.cluster_name}"
  vpc         = var.vpc_id
}

# Cloud Map Service for API
resource "aws_service_discovery_service" "api" {
  name = "api"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "SRV"
    }
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

# Cloud Map Service for WebSocket
resource "aws_service_discovery_service" "websocket" {
  name = "websocket"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "SRV"
    }
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

