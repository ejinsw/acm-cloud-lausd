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
  Grid,
  Paper
} from '@mantine/core';
import { Calendar, Clock, Star, Video } from 'lucide-react';
import Link from 'next/link';
import { Session, Review } from '@/lib/types';

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

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Tabs defaultValue="details">
        <Tabs.List>
          <Tabs.Tab value="details">Details</Tabs.Tab>
          <Tabs.Tab value="instructor">Instructor</Tabs.Tab>
          {session.instructor?.reviews && session.instructor.reviews.length > 0 && (
            <Tabs.Tab value="reviews">
              Reviews ({session.instructor.reviews.length})
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="details" pt="md">
          <Title order={2} mb="sm">{session.name}</Title>
          
          <Group mb="md">
            {session.subjects?.map((subject) => (
              <Badge key={subject.id} size="lg" color="blue">
                {subject.name}
              </Badge>
            ))}
          </Group>
          
          <Text mb="md">{session.description}</Text>
          
          <Group mb="md">
            {session.startTime && (
              <Group gap={6}>
                <Calendar size={18} />
                <Text>{formattedDate}</Text>
              </Group>
            )}
            
            {session.startTime && (
              <Group gap={6}>
                <Clock size={18} />
                <Text>
                  {formattedTime} {endTime && `- ${endTime}`}
                </Text>
              </Group>
            )}
          </Group>
          
          {session.maxAttendees && (
            <Text mb="md">
              <strong>Maximum Attendees:</strong> {session.maxAttendees}
            </Text>
          )}
          
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

        {session.instructor?.reviews && session.instructor.reviews.length > 0 && (
          <Tabs.Panel value="reviews" pt="md">
            <Grid>
              {session.instructor.reviews.map((review: Review) => (
                <Grid.Col span={12} key={review.id}>
                  <Paper withBorder p="md">
                    <Group justify="space-between" mb="xs">
                      <Group>
                        {review.student && (
                          <Avatar
                            src={`https://ui-avatars.com/api/?name=${review.student.firstName}+${review.student.lastName}&background=random`}
                            radius="xl"
                            size="sm"
                          />
                        )}
                        <Text fw={500}>
                          {review.student 
                            ? [review.student.firstName, review.student.lastName].filter(Boolean).join(' ')
                            : 'Anonymous Student'}
                        </Text>
                      </Group>
                      <Group gap={4}>
                        <Star size={16} fill="currentColor" stroke="none" className="text-yellow-500" />
                        <Text>{review.rating}</Text>
                      </Group>
                    </Group>
                    {review.comment && <Text>{review.comment}</Text>}
                    {review.createdAt && (
                      <Text size="xs" c="dimmed" mt="xs">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    )}
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>
        )}
      </Tabs>
    </Card>
  );
} 