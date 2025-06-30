resource "aws_route_table" "private" {
    vpc_id = aws_vpc.main.id

    route {
        cidr_block = "0.0.0.0/0"
    }

    tags = merge(local.standard_tags, {
        Name = "${local.base_name}-private-route-table"
    })
}

resource "aws_route_table" "public" {
    vpc_id = aws_vpc.main.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.igw.id
    }

    tags = merge(local.standard_tags, {
        Name = "${local.base_name}-public-route-table"
    })
}

resource "aws_route_table_association" "private_zone_1" {
    subnet_id = aws_subnet.private_zone_1.id
    route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_zone_2" {
    subnet_id = aws_subnet.private_zone_2.id
    route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "public_zone_1" {
    subnet_id = aws_subnet.public_zone_1.id
    route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_zone_2" {
    subnet_id = aws_subnet.public_zone_2.id
    route_table_id = aws_route_table.public.id
}   