resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.standard_tags, {
    Name = "${local.base_name}-igw"
  }) 
}