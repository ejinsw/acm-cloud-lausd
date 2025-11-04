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

resource "aws_dax_cluster" "bar" {
  cluster_name       = "lausd-dax-cluster"
  iam_role_arn       = aws_iam_role.dax_service.arn
  node_type          = "dax.t3.small"
  replication_factor = 1
}
