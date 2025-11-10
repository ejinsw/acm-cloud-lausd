output "rooms_table_name" {
  description = "Primary DynamoDB table for room metadata."
  value       = aws_dynamodb_table.chat_rooms.name
}

output "room_members_table_name" {
  description = "DynamoDB table tracking room membership."
  value       = aws_dynamodb_table.chat_room_members.name
}

output "room_messages_table_name" {
  description = "DynamoDB table storing chat messages."
  value       = aws_dynamodb_table.chat_room_messages.name
}

output "user_sessions_table_name" {
  description = "DynamoDB table storing user session state."
  value       = aws_dynamodb_table.chat_user_sessions.name
}

output "dax_configuration_endpoint" {
  description = "Endpoint used by clients to configure their DAX connections."
  value       = aws_dax_cluster.bar.configuration_endpoint
}

output "dax_cluster_address" {
  description = "Primary address for the provisioned DAX cluster."
  value       = aws_dax_cluster.bar.cluster_address
}
