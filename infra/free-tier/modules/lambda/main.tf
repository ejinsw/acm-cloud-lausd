resource "aws_lambda_function" "main" {
  function_name = var.function_name
  role          = aws_iam_role.lambda_role.arn
  
  # Use ZIP file when use_container is false
  filename         = var.use_container ? null : data.archive_file.lambda_zip[0].output_path
  source_code_hash = var.use_container ? null : data.archive_file.lambda_zip[0].output_base64sha256
  
  # Use container when use_container is true
  package_type = var.use_container ? "Image" : null
  image_uri    = var.use_container ? var.image_uri : null
  
  # Use runtime when use_container is false
  runtime = var.use_container ? null : "nodejs18.x"
  handler = var.use_container ? null : "index.handler"

  timeout     = var.lambda_timeout
  memory_size = var.lambda_memory

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [var.security_group_id]
  }

  environment {
    variables = var.environment_variables
  }

  tags = {
    Name        = "${var.project_name}-${var.function_name}"
    Environment = var.environment
  }
}

# Create ZIP file for Lambda (only when use_container = false)
data "archive_file" "lambda_zip" {
  count       = var.use_container ? 0 : 1
  type        = "zip"
  output_path = "${path.module}/${var.function_name}.zip"
  
  source {
    content = var.lambda_code
    filename = "index.js"
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-${var.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# ECR permissions (only when use_container = true)
resource "aws_iam_role_policy" "lambda_ecr" {
  count = var.use_container ? 1 : 0
  name  = "${var.project_name}-${var.function_name}-ecr-policy"
  role  = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
        Resource = "*"
      }
    ]
  })
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.main.function_name}"
  retention_in_days = 7  # Free tier optimized

  tags = {
    Name        = "${var.project_name}-${var.function_name}-logs"
    Environment = var.environment
  }
} 