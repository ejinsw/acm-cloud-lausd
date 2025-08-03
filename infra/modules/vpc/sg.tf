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