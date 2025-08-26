# IAM policy for Cognito admin operations
resource "aws_iam_policy" "cognito_admin_policy" {
  name        = "${var.environment}-cognito-admin-policy"
  description = "Policy for Cognito admin operations"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminSetUserPassword",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:AdminDeleteUser",
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminListGroupsForUser",
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:AdminRemoveUserFromGroup",
          "cognito-idp:AdminSetUserMFAPreference",
          "cognito-idp:AdminConfirmSignUp",
          "cognito-idp:AdminDisableUser",
          "cognito-idp:AdminEnableUser",
          "cognito-idp:AdminResetUserPassword",
          "cognito-idp:ListUsers"
        ]
        Resource = [
          var.user_pool_arn
        ]
      }
    ]
  })

  tags = {
    Environment = var.environment
    Project     = "acm-cloud-lausd"
  }
}

# IAM user for the backend service
resource "aws_iam_user" "cognito_admin_user" {
  name = "${var.environment}-cognito-admin-user"
  
  tags = {
    Environment = var.environment
    Project     = "acm-cloud-lausd"
    Purpose     = "Backend service Cognito admin operations"
  }
}

# Attach policy to user
resource "aws_iam_user_policy_attachment" "cognito_admin_attachment" {
  user       = aws_iam_user.cognito_admin_user.name
  policy_arn = aws_iam_policy.cognito_admin_policy.arn
}

# Create access keys for the user
resource "aws_iam_access_key" "cognito_admin_access_key" {
  user = aws_iam_user.cognito_admin_user.name
}

# Alternative: IAM role for ECS/Lambda (more secure for production)
resource "aws_iam_role" "cognito_admin_role" {
  name = "${var.environment}-cognito-admin-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = [
            "ecs-tasks.amazonaws.com",
            "lambda.amazonaws.com"
          ]
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Project     = "acm-cloud-lausd"
  }
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "cognito_admin_role_attachment" {
  role       = aws_iam_role.cognito_admin_role.name
  policy_arn = aws_iam_policy.cognito_admin_policy.arn
}

# Store credentials in AWS Systems Manager Parameter Store (more secure)
resource "aws_ssm_parameter" "cognito_admin_access_key_id" {
  name  = "/${var.environment}/cognito/admin/access_key_id"
  type  = "SecureString"
  value = aws_iam_access_key.cognito_admin_access_key.id

  tags = {
    Environment = var.environment
    Project     = "acm-cloud-lausd"
  }
}

resource "aws_ssm_parameter" "cognito_admin_secret_access_key" {
  name  = "/${var.environment}/cognito/admin/secret_access_key"
  type  = "SecureString"
  value = aws_iam_access_key.cognito_admin_access_key.secret

  tags = {
    Environment = var.environment
    Project     = "acm-cloud-lausd"
  }
}
