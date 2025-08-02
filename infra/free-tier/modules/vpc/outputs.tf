########################################################
################# VPC outputs #########################
########################################################
output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

########################################################
################# Internet Gateway outputs ############
########################################################
output "internet_gateway_id" {
  description = "The ID of the Internet Gateway"
  value       = aws_internet_gateway.igw.id
}

########################################################
################# Subnet outputs #######################
########################################################
output "private_subnet_id_1" {
  description = "The ID of the private subnet in zone 1"
  value       = aws_subnet.private_zone_1.id
}

output "private_subnet_id_2" {
  description = "The ID of the private subnet in zone 2"
  value       = aws_subnet.private_zone_2.id
}

output "public_subnet_id_1" {
  description = "The ID of the public subnet in zone 1"
  value       = aws_subnet.public_zone_1.id
}

output "public_subnet_id_2" {
  description = "The ID of the public subnet in zone 2"
  value       = aws_subnet.public_zone_2.id
}

output "private_route_table_id" {
  description = "The ID of the private route table"
  value       = aws_route_table.private.id
}

output "public_route_table_id" {
  description = "The ID of the public route table"
  value       = aws_route_table.public.id
}

########################################################
################# Security Group outputs ##############
########################################################
output "security_group_id" {
  description = "The ID of the security group"
  value       = aws_security_group.main.id
}