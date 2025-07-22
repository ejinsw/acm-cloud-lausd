output "db_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.main.endpoint
}

output "db_identifier" {
  description = "The identifier of the RDS instance"
  value       = aws_db_instance.main.identifier
}

output "db_port" {
  description = "The port on which the DB accepts connections"
  value       = aws_db_instance.main.port
}

output "db_name" {
  description = "The name of the database"
  value       = aws_db_instance.main.db_name
} 