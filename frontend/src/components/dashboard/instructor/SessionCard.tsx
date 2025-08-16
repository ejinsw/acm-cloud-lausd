import { Card, Text, Group, Badge, Button, ActionIcon, Menu } from "@mantine/core";
import { Eye, Edit, Trash, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Session } from "@/lib/types";

interface SessionCardProps {
  session: Session;
  onDelete?: (session: Session) => void;
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(session);
    }
  };

  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between" mb="xs">
        <Text fw={500} lineClamp={1}>{session.name}</Text>
        <Group gap="xs">
          <StatusBadge status={session.status || 'SCHEDULED'} />
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon variant="subtle">
                <MoreHorizontal size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item 
                leftSection={<Eye size={14} />}
                component={Link}
                href={`/sessions/${session.id}`}
              >
                View Details
              </Menu.Item>
              <Menu.Item 
                leftSection={<Edit size={14} />}
                component={Link}
                href={`/sessions/edit/${session.id}`}
              >
                Edit Session
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                leftSection={<Trash size={14} />}
                color="red"
                onClick={handleDelete}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      
      {/* Description - always show with fallback */}
      <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
        {session.description || "No description provided"}
      </Text>
      
      {/* Subjects - always show with fallback */}
      <Group mb="xs">
        {session.subjects && session.subjects.length > 0 ? (
          session.subjects.map((subject) => (
            <Badge key={subject.id} color="blue">{subject.name}</Badge>
          ))
        ) : (
          <Badge color="gray" variant="light">No subjects</Badge>
        )}
      </Group>
      
      {/* Student info - always show */}
      <Group mb="xs" justify="space-between">
        <Group gap="xs">
          <Text size="sm" c="dimmed">Students:</Text>
          <Text size="sm">{session.students?.length || 0}</Text>
        </Group>
        <Group gap="xs">
          <Text size="sm" c="dimmed">Max:</Text>
          <Text size="sm">{session.maxAttendees || "Unlimited"}</Text>
        </Group>
      </Group>
      
      {/* Date - always show with fallback */}
      <Text size="sm" c="dimmed" mb="md">
        {session.startTime ? new Date(session.startTime).toLocaleDateString() : "Date not set"}
      </Text>
      
      {/* Standardized bottom section for all session cards */}
      <Group mt="md" justify="flex-end">
        <Button 
          variant="light" 
          size="xs" 
          component={Link} 
          href={`/sessions/${session.id}`}
        >
          View Details
        </Button>
        <Button 
          variant="outline" 
          size="xs" 
          component={Link} 
          href={`/sessions/edit/${session.id}`}
        >
          Edit
        </Button>
      </Group>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color;
  let label;

  switch (status) {
    case "SCHEDULED":
      color = "blue";
      label = "Scheduled";
      break;
    case "IN_PROGRESS":
      color = "green";
      label = "In Progress";
      break;
    case "COMPLETED":
      color = "gray";
      label = "Completed";
      break;
    case "CANCELLED":
      color = "red";
      label = "Cancelled";
      break;
    default:
      color = "blue";
      label = status;
  }

  return <Badge color={color}>{label}</Badge>;
}
