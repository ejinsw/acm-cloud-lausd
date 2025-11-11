resource "aws_iam_role" "dax_service" {
  name = "lausd-dax-${var.environment}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "dax.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Environment = var.environment
  }
}

resource "aws_iam_role_policy" "dax_dynamodb_access" {
  name = "lausd-dax-${var.environment}-dynamodb"
  role = aws_iam_role.dax_service.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:DeleteItem",
          "dynamodb:DescribeTable",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_dynamodb_table" "chat_rooms" {
  name         = "lausd-chat-rooms-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "roomId"

  attribute {
    name = "roomId"
    type = "S"
  }

  tags = { Environment = var.environment }
} 

resource "aws_dynamodb_table" "chat_room_members" {
  name         = "lausd-chat-room-members-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "roomId"
  range_key    = "userId"

  attribute { 
    name = "roomId"
   type = "S" 
   }
  attribute { 
    name = "userId"
     type = "S" 
  }

  tags = { Environment = var.environment }
}

resource "aws_dynamodb_table" "chat_room_messages" {
  name         = "lausd-chat-room-messages-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "roomId"
  range_key    = "sentAt"

  attribute { 
  name = "roomId"
   type = "S" 
   }
  attribute { 
    name = "sentAt"
   type = "N" 
  }
  attribute { 
    name = "messageId"
    type = "S" 
  }

  global_secondary_index {
    name            = "messageId"
    hash_key        = "messageId"
    projection_type = "ALL"
  }

  tags = { Environment = var.environment }
}

resource "aws_dynamodb_table" "chat_user_sessions" {
  name         = "lausd-chat-user-sessions-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute { 
  name = "userId"
   type = "S"
  } 

  tags = { Environment = var.environment }
}

resource "aws_dax_cluster" "bar" {
  cluster_name       = "lausd-dax-cluster"
  iam_role_arn       = aws_iam_role.dax_service.arn
  node_type          = "dax.t3.small"
  replication_factor = 1
}
