data "aws_caller_identity" "current" {}

locals {
  instructor_documents_bucket_name = "${var.project_name}-${var.environment}-instructor-documents-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket" "instructor_documents" {
  bucket        = local.instructor_documents_bucket_name
  force_destroy = false

  tags = {
    Name        = local.instructor_documents_bucket_name
    Project     = var.project_name
    Environment = var.environment
    Purpose     = "instructor-verification-documents"
  }
}

resource "aws_s3_bucket_public_access_block" "instructor_documents" {
  bucket = aws_s3_bucket.instructor_documents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "instructor_documents" {
  bucket = aws_s3_bucket.instructor_documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}
