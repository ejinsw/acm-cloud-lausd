# Get available PostgreSQL versions
data "aws_rds_engine_version" "postgres" {
  engine = "postgres"
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db"

  # Free tier specifications
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp2"

  # Database configuration
  engine         = "postgres"
  engine_version = data.aws_rds_engine_version.postgres.version
  username       = var.db_username
  password       = var.db_password
  db_name        = "acmcloud"

  # Free tier optimized settings
  multi_az               = false
  publicly_accessible    = false
  skip_final_snapshot    = true
  deletion_protection    = false
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  # VPC configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]

  tags = {
    Name        = "${var.project_name}-db"
    Environment = var.environment
  }
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name        = "${var.project_name}-db-subnet-group"
    Environment = var.environment
  }
} 