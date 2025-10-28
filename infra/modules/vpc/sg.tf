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

  # Allow ALB to reach Fargate tasks on port 8080 (API)
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
    description = "Allow ALB to reach API on port 8080"
  }

  # Allow ALB to reach Fargate tasks on port 8081 (WebSocket)
  ingress {
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = [var.cidr_block]
    description = "Allow ALB to reach WebSocket on port 8081"
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