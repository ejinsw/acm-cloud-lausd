"use client";

import { 
  Card, 
  Tabs, 
  Title, 
  Text, 
  Group, 
  Badge, 
  Avatar, 
  Rating, 
  Button, 
  Paper,
  Stack,
  List,
  ThemeIcon,
  Progress,
} from '@mantine/core';
import { Calendar, Clock, Video, Target, Book, CalendarDays, Check } from 'lucide-react';
import Link from 'next/link';
import { Session } from '@/lib/types';

interface SessionDetailsProps {
  session: Session;
  onJoinSession?: () => void;
  showJoinButton?: boolean;
}

export function SessionDetails({ session, onJoinSession, showJoinButton = true }: SessionDetailsProps) {
  const formattedDate = session.startTime 
    ? new Date(session.startTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    : null;

  const formattedTime = session.startTime 
    ? new Date(session.startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const endTime = session.endTime 
    ? new Date(session.endTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const getDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return "TBD";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Tabs defaultValue="details">
        <Tabs.List>
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="instructor">Instructor</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="details" pt="md">
          <Stack gap="lg">
            <Title order={2} mb="sm">{session.name}</Title>
            
            <Group mb="md">
              {session.subjects?.map((subject) => (
                <Badge key={subject.id} size="lg" color="blue">
                  {subject.name}
                </Badge>
              ))}
            </Group>
            
            <Text mb="md">{session.description}</Text>

            {/* Learning Objectives */}
            {session.objectives && session.objectives.length > 0 && (
              <Paper p="md" withBorder radius="md">
                <Group gap="md" mb="md">
                  <ThemeIcon size="md" radius="xl" color="green">
                    <Target size={16} />
                  </ThemeIcon>
                  <Title order={4}>Learning Objectives</Title>
                </Group>
                
                <List 
                  spacing="sm"
                  icon={
                    <ThemeIcon size="sm" radius="xl" color="green">
                      <Check size={12} />
                    </ThemeIcon>
                  }
                >
                  {session.objectives.map((objective, index) => (
                    <List.Item key={index}>
                      <Text style={{ lineHeight: 1.6 }}>{objective}</Text>
                    </List.Item>
                  ))}
                </List>
              </Paper>
            )}

            {/* Required Materials */}
            {session.materials && session.materials.length > 0 && (
              <Paper p="md" withBorder radius="md">
                <Group gap="md" mb="md">
                  <ThemeIcon size="md" radius="xl" color="orange">
                    <Book size={16} />
                  </ThemeIcon>
                  <Title order={4}>Required Materials</Title>
                </Group>
                
                <List 
                  spacing="sm"
                  icon={
                    <ThemeIcon size="sm" radius="xl" color="blue">
                      <Book size={12} />
                    </ThemeIcon>
                  }
                >
                  {session.materials.map((material, index) => (
                    <List.Item key={index}>
                      <Text style={{ lineHeight: 1.6 }}>{material}</Text>
                    </List.Item>
                  ))}
                </List>
              </Paper>
            )}
            
            {/* Join Buttons */}
            {session.zoomLink && showJoinButton && (
              <Button 
                component="a" 
                href={session.zoomLink} 
                target="_blank" 
                leftSection={<Video size={16} />}
                mb="md"
              >
                Join Zoom Meeting
              </Button>
            )}
            
            {onJoinSession && showJoinButton && (
              <Button onClick={onJoinSession} color="green" fullWidth>
                Join Session
              </Button>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="instructor" pt="md">
          {session.instructor && (
            <>
              <Group mb="md">
                <Avatar
                  src={`https://ui-avatars.com/api/?name=${session.instructor.firstName}+${session.instructor.lastName}&background=random`}
                  size="xl"
                  radius="xl"
                />
                <div>
                  <Title order={3}>
                    {[session.instructor.firstName, session.instructor.lastName].filter(Boolean).join(' ')}
                  </Title>
                  
                  {session.instructor.averageRating && (
                    <Group gap={5}>
                      <Rating value={session.instructor.averageRating} readOnly fractions={2} />
                      <Text size="sm">{session.instructor.averageRating.toFixed(1)}</Text>
                    </Group>
                  )}
                  
                  {session.instructor.email && (
                    <Text c="dimmed">{session.instructor.email}</Text>
                  )}
                </div>
              </Group>
              
              {session.instructor.subjects && session.instructor.subjects.length > 0 && (
                <>
                  <Text fw={500} mt="md" mb="xs">Subjects</Text>
                  <Group>
                    {session.instructor.subjects.map((subject) => (
                      <Badge key={subject.id}>{subject.name}</Badge>
                    ))}
                  </Group>
                </>
              )}
              
              <Button 
                component={Link} 
                href={`/instructors/${session.instructorId}`}
                variant="outline"
                mt="md"
              >
                View Instructor Profile
              </Button>
            </>
          )}
        </Tabs.Panel>


      </Tabs>
    </Card>
  );
} 