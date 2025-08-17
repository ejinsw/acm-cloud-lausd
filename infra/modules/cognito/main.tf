# Import existing Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = var.user_pool_name

  # Password policy
  password_policy {
    minimum_length                   = 8
    require_uppercase                = true
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }

  # Deletion protection
  deletion_protection = "ACTIVE"

  # Auto verified attributes
  auto_verified_attributes = ["email"]

  # Username attributes
  username_attributes = ["email"]

  # SMS verification message
  sms_verification_message = "Your verification code."

  # Email verification message
  email_verification_message = "Your verification code is {####}.\n\nOr use this link: ${var.frontend_url}/auth/email-verification?code={####}"
  email_verification_subject = "Your verification code"

  # User attribute update settings
  user_attribute_update_settings {
    attributes_require_verification_before_update = []
  }

  # MFA configuration
  mfa_configuration = "OFF"

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Admin create user config
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  # Username configuration
  username_configuration {
    case_sensitive = false
  }

  # Account recovery setting
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
    recovery_mechanism {
      name     = "verified_phone_number"
      priority = 2
    }
  }

  # Schema attributes
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = "0"
      max_length = "2048"
    }
  }

  # Sign in policy
  sign_in_policy {
    allowed_first_auth_factors = ["PASSWORD"]
  }
}

# Import existing Cognito User Pool Client
resource "aws_cognito_user_pool_client" "main" {
  name         = var.user_pool_client_name
  user_pool_id = aws_cognito_user_pool.main.id

  # Explicit auth flows
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_USER_AUTH"
  ]

  token_validity_units {
    refresh_token = "days"
    id_token      = "days"
    access_token  = "days"
  }

  # Token validity periods
  refresh_token_validity = 30  # 1 month
  id_token_validity      = 7   # 7 days
  access_token_validity  = 7   # 7 days

  # Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"
}