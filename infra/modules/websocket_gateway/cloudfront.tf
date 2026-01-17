# CloudFront distribution to provide HTTPS/WSS for the WebSocket ALB
resource "aws_cloudfront_distribution" "websocket" {
  enabled = true
  comment = "CloudFront distribution for WebSocket ALB"

  origin {
    domain_name = aws_lb.websocket.dns_name
    origin_id   = "websocket-alb"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"  # ALB is HTTP, CloudFront provides HTTPS
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "websocket-alb"

    forwarded_values {
      query_string = true
      headers      = ["Host", "Origin", "Sec-WebSocket-Key", "Sec-WebSocket-Version", "Sec-WebSocket-Protocol", "Sec-WebSocket-Extensions"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = false
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true  # Using default CloudFront certificate (*.cloudfront.net)
  }

  tags = {
    Name        = "${var.project_name}-websocket-cloudfront"
    Environment = var.environment
  }
}
