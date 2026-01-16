# This updates the WebSocket ECS service to attach it to the ALB
# Uses AWS CLI to update the service after the target group is created

resource "null_resource" "attach_websocket_to_alb" {
  # Trigger when target group changes
  triggers = {
    target_group_arn = module.websocket_gateway.websocket_target_group_arn
    cluster_id       = module.ecs.cluster_id
    service_name     = module.ecs.websocket_service_name
  }

  provisioner "local-exec" {
    command = <<-EOT
      aws ecs update-service \
        --cluster ${module.ecs.cluster_name} \
        --service ${module.ecs.websocket_service_name} \
        --load-balancers targetGroupArn=${module.websocket_gateway.websocket_target_group_arn},containerName=websocket,containerPort=9999 \
        --region ${var.aws_region} \
        --force-new-deployment || true
    EOT
  }

  depends_on = [
    module.ecs,
    module.websocket_gateway
  ]
}
