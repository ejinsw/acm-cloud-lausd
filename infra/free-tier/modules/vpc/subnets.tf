resource "aws_subnet" "private_zone_1" {
  vpc_id = aws_vpc.main.id
  cidr_block = var.private_subnet_cidr_zone[0]
  availability_zone = var.availability_zones[0]

  tags = merge(local.standard_tags, {
    Name = "${local.base_name}-private-subnet-zone-1"
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/kubernetes" = "owned"
  })
}

resource "aws_subnet" "private_zone_2" {
  vpc_id = aws_vpc.main.id
  cidr_block = var.private_subnet_cidr_zone[1]
  availability_zone = var.availability_zones[1]

  tags = merge(local.standard_tags, {
    Name = "${local.base_name}-private-subnet-zone-2"
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/kubernetes" = "owned"
  })
}

resource "aws_subnet" "public_zone_1" {
  vpc_id = aws_vpc.main.id
  cidr_block = var.public_subnet_cidr_zone[0]
  availability_zone = var.availability_zones[0]
  map_public_ip_on_launch = true

  tags = merge(local.standard_tags, {
    Name = "${local.base_name}-public-subnet-zone-1"
    "kubernetes.io/role/elb" = "1"
    "kubernetes.io/cluster/kubernetes" = "owned"
  })
}

resource "aws_subnet" "public_zone_2" {
  vpc_id = aws_vpc.main.id
  cidr_block = var.public_subnet_cidr_zone[1]
  availability_zone = var.availability_zones[1]
  map_public_ip_on_launch = true

  tags = merge(local.standard_tags, {
    Name = "${local.base_name}-public-subnet-zone-2"
    "kubernetes.io/role/elb" = "1"
    "kubernetes.io/cluster/kubernetes" = "owned"
  })
}