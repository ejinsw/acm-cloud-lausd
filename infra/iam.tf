data "aws_iam_policy_document" "ecs_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_execution_role" {
  name               = "ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task_role" {
  name               = "ecsTaskRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role_policy.json
}

locals {
  dynamodb_table_arns = [
    module.dynamodb_dax.rooms_table_arn,
    module.dynamodb_dax.room_members_table_arn,
    module.dynamodb_dax.room_messages_table_arn,
    module.dynamodb_dax.user_sessions_table_arn,
  ]
}

resource "aws_iam_role_policy" "ecs_task_dynamodb_dax" {
  name = "ecsTaskDynamoDaxAccess"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "DynamoDBAccess"
        Effect   = "Allow"
        Action   = [
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
        Resource = local.dynamodb_table_arns
      },
      # {
      #   Sid      = "DaxAccess"
      #   Effect   = "Allow"
      #   Action   = [
      #     "dax:BatchGetItem",
      #     "dax:BatchWriteItem",
      #     "dax:GetItem",
      #     "dax:PutItem",
      #     "dax:Query",
      #     "dax:Scan"
      #   ]
      #   Resource = [module.dynamodb_dax.dax_cluster_arn]
      # }
    ]
  })
}
