resource "aws_security_group" "main" {
    name = "${local.base_name}-sg"
    description = "Security group for the VPC"
    vpc_id = aws_vpc.main.id

    tags = merge(local.standard_tags, {
        Name = "${local.base_name}-sg"
    })
}