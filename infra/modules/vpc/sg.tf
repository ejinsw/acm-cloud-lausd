resource "aws_security_group" "main" {
    name = "${local.base_name}-sg"
    description = "Security group for the VPC"
    vpc_id = aws_vpc.main.id

    # Allow Lambda to connect to RDS (PostgreSQL)
    ingress {
        from_port = 5432
        to_port = 5432
        protocol = "tcp"
        cidr_blocks = [var.cidr_block]
        description = "Allow Lambda to connect to RDS PostgreSQL"
    }

    # Allow Lambda to access AWS services (Cognito, etc.)
    ingress {
        from_port = 443
        to_port = 443
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
        description = "Allow Lambda to access AWS services"
    }

    # Allow all outbound traffic (needed for Lambda to reach AWS services)
    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
        description = "Allow all outbound traffic"
    }

    tags = merge(local.standard_tags, {
        Name = "${local.base_name}-sg"
    })
}

resource "aws_security_group" "fargate" {
  name        = "fargate-tasks"
  description = "Security group for ECS Fargate tasks"
  vpc_id      = aws_vpc.main.id

  # Allow VPC Link to reach Fargate tasks on port 8080 (API)
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.vpc_link.id]
    description     = "Allow VPC Link to reach API on port 8080"
  }

  # Allow VPC Link to reach Fargate tasks on port 8081 (WebSocket - legacy)
  ingress {
    from_port       = 8081
    to_port         = 8081
    protocol        = "tcp"
    security_groups = [aws_security_group.vpc_link.id]
    description     = "Allow VPC Link to reach WebSocket on port 8081"
  }

  # Allow VPC Link to reach Fargate tasks on port 9999 (WebSocket)
  ingress {
    from_port       = 9999
    to_port         = 9999
    protocol        = "tcp"
    security_groups = [aws_security_group.vpc_link.id]
    description     = "Allow VPC Link to reach WebSocket on port 9999"
  }

  # Also allow ALB for backward compatibility (if still using ALB for direct access)
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
    description = "Allow ALB to reach API on port 8080"
  }

  ingress {
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
    description = "Allow ALB to reach WebSocket on port 8081"
  }

  # Allow ALB to reach WebSocket on port 9999
  ingress {
    from_port   = 9999
    to_port     = 9999
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
    description = "Allow ALB to reach WebSocket on port 9999"
  }

  # Outbound HTTPS (Cognito, etc)
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outbound HTTPS to Cognito and other AWS services"
  }

  # Allow all other outbound traffic (optional, for updates, etc)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
}

resource "aws_security_group" "alb" {
  name        = "alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  # Allow HTTP traffic from internet
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP traffic from internet"
  }

  # Allow HTTPS traffic from internet (for future use)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS traffic from internet"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
}

resource "aws_security_group" "vpc_link" {
  name        = "vpc-link-sg"
  description = "Security group for API Gateway VPC Link"
  vpc_id      = aws_vpc.main.id

  # Allow outbound HTTP to ECS tasks (via Cloud Map)
  egress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
    description = "Allow outbound HTTP to API tasks on port 8080"
  }

  egress {
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
    description = "Allow outbound HTTP to WebSocket tasks on port 8081"
  }

  egress {
    from_port   = 9999
    to_port     = 9999
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
    description = "Allow outbound HTTP to WebSocket tasks on port 9999"
  }

  # Allow outbound HTTPS (for future use)
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outbound HTTPS"
  }

  tags = merge(local.standard_tags, {
    Name = "${local.base_name}-vpc-link-sg"
  })
}

resource "aws_security_group" "rds" {
  name        = "rds"
  description = "Security group for RDS instance"
  vpc_id      = aws_vpc.main.id

  # Inbound from Fargate
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.fargate.id]
    description     = "Allow inbound DB access from Fargate"
  }
}