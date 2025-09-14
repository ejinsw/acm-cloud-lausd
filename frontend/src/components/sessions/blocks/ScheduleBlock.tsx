import { useState } from "react";
import { Paper, Text, Group, ActionIcon, Box, Switch, Chip, NumberInput } from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { Edit3, Check, X, Calendar, Clock, Repeat, Trash2 } from "lucide-react";

interface ScheduleBlockProps {
  recurring: boolean;
  availableDays: string[];
  dates: Date[];
  time: string;
  maxStudents: number;
  duration: number;
  onUpdate: (data: {
    recurring: boolean;
    availableDays: string[];
    dates: Date[];
    time: string;
    maxStudents: number;
    duration: number;
  }) => void;
  onRemove?: () => void;
  isRemovable?: boolean;
}

const weekdays = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

export function ScheduleBlock({ 
  recurring, 
  availableDays, 
  dates, 
  time, 
  maxStudents, 
  duration,
  onUpdate,
  onRemove,
  isRemovable = false
}: ScheduleBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempRecurring, setTempRecurring] = useState(recurring);
  const [tempAvailableDays, setTempAvailableDays] = useState(availableDays);
  const [tempDates, setTempDates] = useState(dates);
  const [tempTime, setTempTime] = useState(time);
  const [tempMaxStudents, setTempMaxStudents] = useState(maxStudents);
  const [tempDuration, setTempDuration] = useState(duration);

  const handleSave = () => {
    onUpdate({
      recurring: tempRecurring,
      availableDays: tempAvailableDays,
      dates: tempDates,
      time: tempTime,
      maxStudents: tempMaxStudents,
      duration: tempDuration,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempRecurring(recurring);
    setTempAvailableDays(availableDays);
    setTempDates(dates);
    setTempTime(time);
    setTempMaxStudents(maxStudents);
    setTempDuration(duration);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Paper p="lg" radius="lg" withBorder bg="indigo.0">
        <Group justify="space-between" mb="md">
          <Text size="sm" c="indigo" fw={500}>Schedule & Availability</Text>
          <Group gap="xs">
            <ActionIcon 
              variant="light" 
              color="green" 
              size="sm"
              onClick={handleSave}
            >
              <Check size={16} />
            </ActionIcon>
            <ActionIcon 
              variant="light" 
              color="red" 
              size="sm"
              onClick={handleCancel}
            >
              <X size={16} />
            </ActionIcon>
          </Group>
        </Group>
        
        <Box mb="md">
          <Switch
            label="Recurring Session"
            description="Enable for regular weekly sessions"
            checked={tempRecurring}
            onChange={(e) => setTempRecurring(e.currentTarget.checked)}
            mb="md"
          />
          
          {tempRecurring ? (
            <>
              <Text size="sm" fw={500} mb="xs" c="dimmed">
                <Repeat size={14} style={{ display: 'inline', marginRight: 5 }} />
                Available Days
              </Text>
              <Box mb="lg">
                <Chip.Group
                  multiple
                  value={tempAvailableDays}
                  onChange={setTempAvailableDays}
                >
                  <Group>
                    {weekdays.map((day) => (
                      <Chip key={day.value} value={day.value}>
                        {day.label}
                      </Chip>
                    ))}
                  </Group>
                </Chip.Group>
              </Box>
            </>
          ) : (
            <>
              <Text size="sm" fw={500} mb="xs" c="dimmed">
                <Calendar size={14} style={{ display: 'inline', marginRight: 5 }} />
                Available Dates
              </Text>
              <DatePickerInput
                type="multiple"
                placeholder="Pick dates"
                value={tempDates}
                onChange={setTempDates}
                mb="lg"
                minDate={new Date()}
              />
            </>
          )}
          
          <Group gap="md">
            <TimeInput
              label="Preferred Time"
              leftSection={<Clock size={16} />}
              value={tempTime}
              onChange={(e) => setTempTime(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <NumberInput
              label="Duration (minutes)"
              placeholder="60"
              min={15}
              max={240}
              step={15}
              value={tempDuration}
              onChange={(value) => setTempDuration(value as number)}
              style={{ flex: 1 }}
            />
          </Group>
          
          <NumberInput
            label="Maximum Students"
            placeholder="1"
            description="Number of students allowed per session"
            min={1}
            max={20}
            value={tempMaxStudents}
            onChange={(value) => setTempMaxStudents(value as number)}
            mt="md"
          />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper p="lg" radius="lg" withBorder bg="gray.0">
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Calendar size={18} color="#4C6EF5" />
          <Text size="sm" c="dimmed" fw={500}>Schedule & Availability</Text>
        </Group>
        <Group gap="xs">
          <ActionIcon 
            variant="subtle" 
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 size={16} />
          </ActionIcon>
          {isRemovable && onRemove && (
            <ActionIcon 
              variant="subtle" 
              color="red" 
              size="sm"
              onClick={onRemove}
            >
              <Trash2 size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>
      
      <Box>
        <Group gap="md" mb="md">
          <Chip variant="light" color="blue" checked={false} readOnly>
            {recurring ? "Recurring" : "One-time"}
          </Chip>
          <Chip variant="light" color="green" checked={false} readOnly>
            {duration} min
          </Chip>
          <Chip variant="light" color="orange" checked={false} readOnly>
            Max {maxStudents} student{maxStudents > 1 ? 's' : ''}
          </Chip>
        </Group>
        
        {recurring ? (
          <Box>
            <Text size="sm" fw={500} mb="xs" c="dimmed">
              <Repeat size={14} style={{ display: 'inline', marginRight: 5 }} />
              Available Days
            </Text>
            <Group gap="xs">
              {availableDays.map((day) => (
                <Chip 
                  key={day} 
                  variant="light" 
                  color="indigo" 
                  size="sm"
                  checked={false}
                  readOnly
                >
                  {weekdays.find(d => d.value === day)?.label || day}
                </Chip>
              ))}
            </Group>
          </Box>
        ) : (
          <Box>
            <Text size="sm" fw={500} mb="xs" c="dimmed">
              <Calendar size={14} style={{ display: 'inline', marginRight: 5 }} />
              Available Dates
            </Text>
            <Text size="sm" c="dark.8">
              {dates.length > 0 
                ? `${dates.length} date${dates.length > 1 ? 's' : ''} selected`
                : 'No dates selected'
              }
            </Text>
          </Box>
        )}
        
        {time && (
          <Box mt="md">
            <Text size="sm" fw={500} mb="xs" c="dimmed">
              <Clock size={14} style={{ display: 'inline', marginRight: 5 }} />
              Time
            </Text>
            <Text size="sm" c="dark.8">{time}</Text>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
