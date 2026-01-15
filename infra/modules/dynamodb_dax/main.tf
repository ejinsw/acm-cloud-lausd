locals {
  ttl_attribute_name    = "expiresAt"
  # use_custom_networking = var.dax_vpc_id != "" && length(var.dax_subnet_ids) > 0
}

# DAX IAM role - commented out to reduce costs (using direct DynamoDB access)
# resource "aws_iam_role" "dax_service" {
#   name = "lausd-dax-${var.environment}-role"
#
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Principal = {
#           Service = "dax.amazonaws.com"
#         }
#         Action = "sts:AssumeRole"
#       }
#     ]
#   })
#
#   tags = {
#     Environment = var.environment
#   }
# }
#
# resource "aws_iam_role_policy" "dax_dynamodb_access" {
#   name = "lausd-dax-${var.environment}-dynamodb"
#   role = aws_iam_role.dax_service.id
#
#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Action = [
#           "dynamodb:BatchGetItem",
#           "dynamodb:BatchWriteItem",
#           "dynamodb:DeleteItem",
#           "dynamodb:DescribeTable",
#           "dynamodb:GetItem",
#           "dynamodb:PutItem",
#           "dynamodb:Query",
#           "dynamodb:Scan",
#           "dynamodb:UpdateItem"
#         ]
#         Resource = "*"
#       }
#     ]
#   })
# }

resource "aws_dynamodb_table" "chat_rooms" {
  name         = "lausd-chat-rooms-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "roomId"

  attribute {
    name = "roomId"
    type = "S"
  }

  ttl {
    attribute_name = local.ttl_attribute_name
    enabled        = true
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

  ttl {
    attribute_name = local.ttl_attribute_name
    enabled        = true
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

  ttl {
    attribute_name = local.ttl_attribute_name
    enabled        = true
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

  ttl {
    attribute_name = local.ttl_attribute_name
    enabled        = true
  }

  tags = { Environment = var.environment }
}

# DAX cluster - commented out to reduce costs (using direct DynamoDB access)
# resource "aws_dax_subnet_group" "this" {
#   count      = local.use_custom_networking ? 1 : 0
#   name       = "lausd-dax-${var.environment}-subnet-group"
#   subnet_ids = var.dax_subnet_ids
# }
#
# resource "aws_security_group" "dax" {
#   count       = local.use_custom_networking ? 1 : 0
#   name_prefix = "lausd-dax-${var.environment}-"
#   description = "Access control for the LAUSD DAX cluster"
#   vpc_id      = var.dax_vpc_id
#
#   egress {
#     description = "Allow all outbound so the cluster can reach DynamoDB"
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#     ipv6_cidr_blocks = ["::/0"]
#   }
#
#   tags = {
#     Environment = var.environment
#   }
# }
#
# resource "aws_security_group_rule" "dax_allow_security_groups" {
#   count                    = local.use_custom_networking ? length(var.dax_allowed_security_group_ids) : 0
#   type                     = "ingress"
#   from_port                = 8111
#   to_port                  = 8111
#   protocol                 = "tcp"
#   security_group_id        = aws_security_group.dax[0].id
#   source_security_group_id = var.dax_allowed_security_group_ids[count.index]
#   description              = "Allow DAX traffic from dependent services"
# }
#
# resource "aws_security_group_rule" "dax_allow_cidrs" {
#   count             = local.use_custom_networking ? length(var.dax_allowed_cidr_blocks) : 0
#   type              = "ingress"
#   from_port         = 8111
#   to_port           = 8111
#   protocol          = "tcp"
#   security_group_id = aws_security_group.dax[0].id
#   cidr_blocks       = [var.dax_allowed_cidr_blocks[count.index]]
#   description       = "Allow DAX traffic from specified CIDR ranges"
# }
#
# resource "aws_dax_cluster" "bar" {
#   cluster_name       = "lausd-dax-${var.environment}"
#   iam_role_arn       = aws_iam_role.dax_service.arn
#   node_type          = var.dax_node_type
#   replication_factor = var.dax_replication_factor
#   subnet_group_name  = local.use_custom_networking ? aws_dax_subnet_group.this[0].name : null
#   security_group_ids = local.use_custom_networking ? [aws_security_group.dax[0].id] : null
#
#   tags = {
#     Environment = var.environment
#   }
# }
