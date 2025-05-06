"use client";

import { useState } from "react";
import { 
  Container, 
  Title, 
  Text, 
  Grid,
  Select,
  TextInput,
  Button,
  Card,
  Badge,
  Group,
  Avatar,
  RangeSlider,
  Flex,
  Box
} from "@mantine/core";

// Sample data
const subjects = [
  { value: "all", label: "All Subjects" },
  { value: "math", label: "Mathematics" },
  { value: "english", label: "English" },
  { value: "science", label: "Science" },
  { value: "history", label: "History" },
  { value: "language", label: "Foreign Languages" },
  { value: "programming", label: "Computer Programming" },
];

const sessionsMockData = [
  {
    id: 1,
    title: "Algebra Fundamentals",
    instructor: {
      id: 101,
      name: "Dr. Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4.8,
    },
    subject: "Mathematics",
    level: "Beginner",
    price: 25,
    duration: 60,
    description: "Master the basics of algebra including equations, inequalities, and functions.",
    tags: ["Algebra", "Math", "Equations"],
    availability: ["Monday", "Wednesday", "Friday"],
  },
  {
    id: 2,
    title: "Creative Writing Workshop",
    instructor: {
      id: 102,
      name: "Sarah Williams",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 4.9,
    },
    subject: "English",
    level: "Intermediate",
    price: 30,
    duration: 90,
    description: "Develop your storytelling abilities and learn techniques for engaging writing.",
    tags: ["Writing", "Creative", "Stories"],
    availability: ["Tuesday", "Thursday"],
  },
  {
    id: 3,
    title: "Chemistry for High School Students",
    instructor: {
      id: 103,
      name: "Prof. Michael Chen",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      rating: 4.7,
    },
    subject: "Science",
    level: "Advanced",
    price: 35,
    duration: 75,
    description: "Prepare for AP Chemistry or improve your understanding of chemical principles.",
    tags: ["Chemistry", "AP Prep", "Science"],
    availability: ["Monday", "Wednesday", "Saturday"],
  },
  {
    id: 4,
    title: "Spanish Conversation Practice",
    instructor: {
      id: 104,
      name: "Elena Rodriguez",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      rating: 5.0,
    },
    subject: "Foreign Languages",
    level: "All Levels",
    price: 28,
    duration: 45,
    description: "Practice your Spanish speaking skills in a supportive environment.",
    tags: ["Spanish", "Conversation", "Language"],
    availability: ["Tuesday", "Thursday", "Sunday"],
  },
];

function SessionCard({ session }: { session: typeof sessionsMockData[0] }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section className="bg-blue-50 p-4">
        <Group>
          <Avatar src={session.instructor.avatar} size="lg" radius="xl" />
          <div>
            <Text fw={500}>{session.instructor.name}</Text>
            <Group gap={5}>
              <Text size="xs" c="dimmed">Rating: {session.instructor.rating}/5</Text>
              <Badge color="blue" size="sm">{session.subject}</Badge>
              <Badge color="gray" size="sm">{session.level}</Badge>
            </Group>
          </div>
        </Group>
      </Card.Section>

      <Text fw={700} size="lg" mt="md">{session.title}</Text>
      <Text size="sm" c="dimmed" lineClamp={2}>{session.description}</Text>
      
      <Group mt="md" mb="xs">
        {session.tags.map((tag) => (
          <Badge key={tag} size="sm" variant="light">{tag}</Badge>
        ))}
      </Group>
      
      <Text size="sm" mb="md">
        <b>Duration:</b> {session.duration} minutes | <b>Price:</b> ${session.price}/hr
      </Text>
      
      <Text size="sm" mb="md">
        <b>Available:</b> {session.availability.join(", ")}
      </Text>
      
      <Button fullWidth component="a" href={`/sessions/${session.id}`}>
        View Details
      </Button>
    </Card>
  );
}

export default function BrowseSessionsPage() {
  const [subject, setSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 40]);
  const [filteredSessions, setFilteredSessions] = useState(sessionsMockData);

  const handleSearch = () => {
    const filtered = sessionsMockData.filter((session) => {
      // Filter by subject if not "all"
      if (subject !== "all" && !session.subject.toLowerCase().includes(subject)) {
        return false;
      }
      
      // Filter by price range
      if (session.price < priceRange[0] || session.price > priceRange[1]) {
        return false;
      }
      
      // Filter by search query (title, instructor name, description)
      if (searchQuery && !session.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !session.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !session.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    setFilteredSessions(filtered);
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="lg">Find Your Perfect Tutoring Session</Title>
      
      <Box className="bg-gray-50 p-4 rounded-lg mb-8">
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Search"
              placeholder="Session title, instructor, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              label="Subject"
              placeholder="Select a subject"
              data={subjects}
              value={subject}
              onChange={(value) => setSubject(value || "all")}
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Text size="sm" mb={5}>Price Range ($/hr)</Text>
            <RangeSlider
              min={15}
              max={100}
              step={5}
              minRange={5}
              value={priceRange}
              onChange={setPriceRange}
              marks={[
                { value: 15, label: '$15' },
                { value: 50, label: '$50' },
                { value: 100, label: '$100' },
              ]}
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 2 }}>
            <Button fullWidth onClick={handleSearch}>Search</Button>
          </Grid.Col>
        </Grid>
      </Box>
      
      {filteredSessions.length === 0 ? (
        <Flex justify="center" align="center" direction="column" h={200}>
          <Text size="lg" fw={500}>No sessions found matching your criteria</Text>
          <Button variant="outline" mt="md" onClick={() => {
            setSubject("all");
            setSearchQuery("");
            setPriceRange([20, 40]);
            setFilteredSessions(sessionsMockData);
          }}>
            Reset Filters
          </Button>
        </Flex>
      ) : (
        <Grid>
          {filteredSessions.map((session) => (
            <Grid.Col key={session.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <SessionCard session={session} />
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
} 