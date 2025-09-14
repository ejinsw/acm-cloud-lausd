import { Grid, Card, Group, Text, Badge, Button, Stack } from "@mantine/core";
import { Calendar, User, BookOpen, X } from "lucide-react";
import Link from "next/link";
import { routes } from "@/app/routes";
import { SessionRequest } from "@/lib/types";

interface SessionRequestsTabProps {
  sessionRequests: SessionRequest[];
  onCancelRequest: (requestId: string) => void;
}

// Format date for display
function formatSessionDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Determine status badge color
function getStatusColor(status: string) {
  switch(status) {
    case 'PENDING': return 'yellow';
    case 'ACCEPTED': return 'green';
    case 'REJECTED': return 'red';
    default: return 'gray';
  }
}

export function SessionRequestsTab({ sessionRequests, onCancelRequest }: SessionRequestsTabProps) {
  if (sessionRequests.length === 0) {
    return (
      <Card withBorder shadow="sm" p="xl" ta="center">
        <Text size="lg" fw={500} mb="md">You don&apos;t have any session requests</Text>
        <Button 
          component={Link} 
          href={routes.exploreSessions}
          leftSection={<BookOpen size={16} />}
        >
          Explore Sessions
        </Button>
      </Card>
    );
  }

  return (
    <Grid>
      {sessionRequests.map((request) => (
        <Grid.Col key={request.id} span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p="md">
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="lg">{request.session?.name || 'Session'}</Text>
              <Badge color={getStatusColor(request.status || 'PENDING')}>
                {request.status || 'PENDING'}
              </Badge>
            </Group>
            
            <Stack gap="xs" mb="md">
              <Group gap="xs">
                <User size={14} />
                <Text size="sm">
                  {request.session?.instructor?.firstName} {request.session?.instructor?.lastName}
                </Text>
              </Group>
              
              {request.session?.startTime && (
                <Group gap="xs">
                  <Calendar size={14} />
                  <Text size="sm">
                    {formatSessionDate(request.session.startTime)}
                  </Text>
                </Group>
              )}
              
              {request.session?.description && (
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {request.session.description}
                </Text>
              )}
            </Stack>
            
            <Group justify="space-between">
              <Button 
                component={Link} 
                href={routes.sessionDetails(request.session?.id || '')} 
                variant="light" 
                size="xs"
              >
                View Session
              </Button>
              
              {request.status === 'PENDING' && (
                <Button 
                  variant="light" 
                  color="red" 
                  size="xs"
                  leftSection={<X size={14} />}
                  onClick={() => onCancelRequest(request.id)}
                >
                  Cancel Request
                </Button>
              )}
            </Group>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
}
