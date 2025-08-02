"use client";

import { Card, Avatar, Text, Group, Button, Rating, Badge } from '@mantine/core';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/app/routes';
export interface SessionCardProps {
  id: string;
  name: string;
  description?: string;
  startTime?: Date;
  price?: number;
  duration?: number;
  instructor: {
    id: string;
    firstName?: string;
    lastName?: string;
    averageRating?: number;
    email?: string;
  };
  subjects: Array<{
    id: string;
    name: string;
  }>;
  variant?: 'compact' | 'detailed';
  onJoinSession?: () => void;
}

export function SessionCard({
  id,
  name,
  description,
  startTime,
  price,
  duration = 60,
  instructor,
  subjects,
  variant = 'detailed',
  onJoinSession,
}: SessionCardProps) {
  const instructorName = [instructor.firstName, instructor.lastName]
    .filter(Boolean)
    .join(' ') || 'Instructor';

  const formattedDate = startTime ? new Date(startTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }) : null;

  const formattedTime = startTime ? new Date(startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }) : null;

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder h="100%">
      {variant === 'detailed' ? (
        <>
          <Group mb="xs">
            <Avatar
              src={`https://ui-avatars.com/api/?name=${instructorName}&background=random`}
              alt={instructorName}
              radius="xl"
              size="md"
            />
            <div>
              <Text fw={500}>{instructorName}</Text>
              {instructor.averageRating && (
                <Group gap={4}>
                  <Rating value={instructor.averageRating} readOnly fractions={2} size="xs" />
                  <Text size="xs" c="dimmed">{instructor.averageRating.toFixed(1)}</Text>
                </Group>
              )}
            </div>
          </Group>

          <Text fw={600} size="lg" mb="xs">{name}</Text>
          
          {description && (
            <Text size="sm" lineClamp={2} mb="md" c="dimmed">
              {description}
            </Text>
          )}

          <Group gap="xs" mb="md">
            {subjects.map((subject) => (
              <Badge key={subject.id} size="sm">{subject.name}</Badge>
            ))}
          </Group>

          {(startTime || price || duration) && (
            <Group mb="md">
              {startTime && (
                <Group gap={4} wrap="nowrap">
                  <Calendar size={16} />
                  <Text size="xs">{formattedDate} {formattedTime}</Text>
                </Group>
              )}
              {duration && (
                <Group gap={4} wrap="nowrap">
                  <Clock size={16} />
                  <Text size="xs">{duration} min</Text>
                </Group>
              )}
              {price !== undefined && (
                <Group gap={4} wrap="nowrap">
                  <DollarSign size={16} />
                  <Text size="xs">${price}</Text>
                </Group>
              )}
            </Group>
          )}

          {onJoinSession ? (
            <Button fullWidth onClick={onJoinSession}>
              Join Session
            </Button>
          ) : (
            <Button component={Link} href={routes.sessionDetails(id)} fullWidth>
              View Details
            </Button>
          )}
        </>
      ) : (
        // Compact variant
        <>
          <Group justify="space-between" mb="xs">
            <Text fw={600}>{name}</Text>
            {instructor.averageRating && (
              <Group gap={4}>
                <Rating value={instructor.averageRating} readOnly fractions={2} size="xs" />
                <Text size="xs">{instructor.averageRating.toFixed(1)}</Text>
              </Group>
            )}
          </Group>
          
          <Group mb="xs" gap="xs">
            <Avatar
              src={`https://ui-avatars.com/api/?name=${instructorName}&background=random`}
              alt={instructorName}
              radius="xl"
              size="sm"
            />
            <Text size="sm">{instructorName}</Text>
          </Group>

          <Group gap="xs" mb="xs">
            {subjects.slice(0, 2).map((subject) => (
              <Badge key={subject.id} size="xs">{subject.name}</Badge>
            ))}
            {subjects.length > 2 && <Badge size="xs">+{subjects.length - 2}</Badge>}
          </Group>

          <Group mb="xs" justify="space-between">
            {startTime && (
              <Text size="xs" c="dimmed">{formattedDate}</Text>
            )}
            {duration && (
              <Text size="xs" c="dimmed">{duration} min</Text>
            )}
            {price !== undefined && (
              <Text size="xs" fw={500}>${price}</Text>
            )}
          </Group>

          <Button 
            component={Link} 
            href={`/sessions/${id}`} 
            variant="light" 
            fullWidth 
            size="xs"
          >
            Details
          </Button>
        </>
      )}
    </Card>
  );
} 