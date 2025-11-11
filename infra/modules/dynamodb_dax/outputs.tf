output "rooms_table_name" {
  description = "Primary DynamoDB table for room metadata."
  value       = aws_dynamodb_table.chat_rooms.name
}

output "rooms_table_arn" {
  description = "ARN for the room metadata table."
  value       = aws_dynamodb_table.chat_rooms.arn
}

output "room_members_table_name" {
  description = "DynamoDB table tracking room membership."
  value       = aws_dynamodb_table.chat_room_members.name
}

output "room_members_table_arn" {
  description = "ARN for the room membership table."
  value       = aws_dynamodb_table.chat_room_members.arn
}

output "room_messages_table_name" {
  description = "DynamoDB table storing chat messages."
  value       = aws_dynamodb_table.chat_room_messages.name
}

output "room_messages_table_arn" {
  description = "ARN for the chat messages table."
  value       = aws_dynamodb_table.chat_room_messages.arn
}

output "user_sessions_table_name" {
  description = "DynamoDB table storing user session state."
  value       = aws_dynamodb_table.chat_user_sessions.name
}

output "user_sessions_table_arn" {
  description = "ARN for the user session table."
  value       = aws_dynamodb_table.chat_user_sessions.arn
}

output "dax_configuration_endpoint" {
  description = "Endpoint used by clients to configure their DAX connections."
  value       = aws_dax_cluster.bar.configuration_endpoint
}

output "dax_cluster_address" {
  description = "Primary address for the provisioned DAX cluster."
  value       = aws_dax_cluster.bar.cluster_address
}

output "dax_cluster_arn" {
  description = "ARN of the DAX cluster."
  value       = aws_dax_cluster.bar.arn
}
