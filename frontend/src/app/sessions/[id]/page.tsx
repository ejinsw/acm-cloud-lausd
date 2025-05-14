"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Container, 
  Grid, 
  Title, 
  Text, 
  Button, 
  Card, 
  Group, 
  Avatar, 
  Badge, 
  Tabs, 
  Textarea,
  Paper,
  ActionIcon,
  ScrollArea,
  Divider,
  Flex,
  Box
} from "@mantine/core";
import { Calendar, Clock, Send, Star, Video } from "lucide-react";

// Mock session data (would come from API in real app)
const sessionsMockData = [
  {
    id: 1,
    title: "Algebra Fundamentals",
    instructor: {
      id: 101,
      name: "Dr. Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4.8,
      bio: "Mathematics professor with 15 years of teaching experience. Specializing in making algebra accessible and engaging for students of all levels.",
      credentials: "Ph.D. in Mathematics, UCLA",
    },
    subject: "Mathematics",
    level: "Beginner",
    price: 25,
    duration: 60,
    description: "Master the basics of algebra including equations, inequalities, and functions. This session is perfect for students who are struggling with core algebra concepts or want to build a solid foundation.",
    longDescription: "This comprehensive session covers all the fundamental concepts of algebra that students need to succeed. We'll start with basic operations and gradually move to solving equations, working with inequalities, and understanding functions. The session includes practice problems, visual explanations, and real-world applications to help solidify understanding. Students will leave with a stronger grasp of algebraic concepts and improved problem-solving skills.",
    tags: ["Algebra", "Math", "Equations"],
    availability: ["Monday", "Wednesday", "Friday"],
    prerequisites: "Basic arithmetic skills",
    materials: "Pencil, paper, and calculator",
    goals: ["Understand basic algebraic operations", "Solve linear equations", "Graph simple functions"],
    reviews: [
      { id: 1, user: "Jamie S.", rating: 5, comment: "Dr. Johnson explained concepts clearly and was very patient with my questions." },
      { id: 2, user: "Taylor W.", rating: 4, comment: "Very helpful session. I feel much more confident with algebra now." },
      { id: 3, user: "Alex R.", rating: 5, comment: "Excellent tutor! Made complex topics easy to understand." },
    ],
    topics: ["Basic operations", "Linear equations", "Inequalities", "Introduction to functions", "Graphing"],
  },
  // More sessions would be here
];

// Mock chat messages
const initialMessages = [
  { id: 1, sender: "system", text: "Chat session started. You can message your instructor here before, during, or after your scheduled session.", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, sender: "instructor", text: "Hello! I'm looking forward to our session. Do you have any specific topics you'd like to focus on?", timestamp: new Date(Date.now() - 1800000).toISOString() },
];

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = Number(params.id);
  const session = sessionsMockData.find(s => s.id === sessionId) || sessionsMockData[0];
  
  const [activeTab, setActiveTab] = useState<string | null>("details");
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: "student",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
    
    // Simulate instructor response after a delay
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        sender: "instructor",
        text: "Thanks for your message! I'll make sure to address that during our session.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };
  
  function formatMessageTime(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <Container size="xl" py="xl">
      <Grid>
        {/* Left column: Session details */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Title order={1} mb="xs">{session.title}</Title>
          
          <Group mb="lg">
            <Badge size="lg" color="blue">{session.subject}</Badge>
            <Badge size="lg" color="gray">{session.level}</Badge>
            <Badge size="lg" color="green">
              <Group gap={4}>
                <Star size={14} />
                <span>{session.instructor.rating}/5</span>
              </Group>
            </Badge>
          </Group>
          
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="details">Details</Tabs.Tab>
              <Tabs.Tab value="instructor">Instructor</Tabs.Tab>
              <Tabs.Tab value="reviews">Reviews ({session.reviews.length})</Tabs.Tab>
            </Tabs.List>
            
            <Tabs.Panel value="details" pt="md">
              <Text mb="md">{session.longDescription}</Text>
              
              <Title order={3} mt="lg" mb="sm">What You&apos;ll Learn</Title>
              <ul className="list-disc ml-5 mb-4">
                {session.topics.map((topic, i) => (
                  <li key={i}><Text>{topic}</Text></li>
                ))}
              </ul>
              
              <Title order={3} mt="lg" mb="sm">Goals</Title>
              <ul className="list-disc ml-5 mb-4">
                {session.goals.map((goal, i) => (
                  <li key={i}><Text>{goal}</Text></li>
                ))}
              </ul>
              
              <Grid mt="lg">
                <Grid.Col span={6}>
                  <Card withBorder>
                    <Title order={4} mb="sm">Prerequisites</Title>
                    <Text>{session.prerequisites}</Text>
                  </Card>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Card withBorder>
                    <Title order={4} mb="sm">Materials Needed</Title>
                    <Text>{session.materials}</Text>
                  </Card>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>
            
            <Tabs.Panel value="instructor" pt="md">
              <Group mb="md">
                <Avatar src={session.instructor.avatar} size="xl" radius="xl" />
                <div>
                  <Title order={3}>{session.instructor.name}</Title>
                  <Text c="dimmed">{session.instructor.credentials}</Text>
                  <Group gap={4} mt={5}>
                    <Star size={16} className="text-yellow-500" />
                    <Text>{session.instructor.rating}/5 Rating</Text>
                  </Group>
                </div>
              </Group>
              
              <Text mb="md">{session.instructor.bio}</Text>
              
              <Button variant="outline" leftSection={<Video size={16} />}>
                View Instructor Profile
              </Button>
            </Tabs.Panel>
            
            <Tabs.Panel value="reviews" pt="md">
              {session.reviews.map((review) => (
                <Paper key={review.id} withBorder p="md" mb="md">
                  <Group justify="space-between" mb="xs">
                    <Text fw={600}>{review.user}</Text>
                    <Group gap={4}>
                      <Star size={16} className="text-yellow-500" />
                      <Text>{review.rating}/5</Text>
                    </Group>
                  </Group>
                  <Text>{review.comment}</Text>
                </Paper>
              ))}
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
        
        {/* Right column: Booking and chat */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder shadow="sm" mb="lg">
            <Title order={3} mb="md">Book This Session</Title>
            
            <Group mb="xs">
              <Clock size={20} />
              <Text>{session.duration} minutes</Text>
            </Group>
            
            <Group mb="md">
              <Calendar size={20} />
              <Text>Available: {session.availability.join(", ")}</Text>
            </Group>
            
            <Button fullWidth mb="md" color="blue">Schedule Session</Button>
            <Button fullWidth variant="outline">Contact Instructor</Button>
          </Card>
          
          <Card withBorder shadow="sm">
            <Title order={3} mb="md">Session Chat</Title>
            
            <ScrollArea h={300} mb="md">
              {messages.map((message) => (
                <Box
                  key={message.id}
                  className={`mb-3 ${
                    message.sender === "student" 
                      ? "ml-auto max-w-[80%]" 
                      : "mr-auto max-w-[80%]"
                  }`}
                >
                  {message.sender === "system" ? (
                    <Paper p="xs" withBorder className="bg-gray-100 text-center">
                      <Text size="sm">{message.text}</Text>
                    </Paper>
                  ) : (
                    <Paper 
                      p="sm" 
                      withBorder 
                      className={message.sender === "student" ? "bg-blue-50" : ""}
                    >
                      <Flex justify="space-between" align="center" mb={4}>
                        <Text size="sm" fw={600}>
                          {message.sender === "instructor" 
                            ? session.instructor.name 
                            : "You"}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatMessageTime(message.timestamp)}
                        </Text>
                      </Flex>
                      <Text>{message.text}</Text>
                    </Paper>
                  )}
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
            
            <Divider mb="md" />
            
            <Group>
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.currentTarget.value)}
                style={{ flex: 1 }}
                autosize
                minRows={1}
                maxRows={4}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <ActionIcon 
                size="lg" 
                variant="filled" 
                color="blue"
                onClick={handleSendMessage}
                disabled={newMessage.trim() === ""}
              >
                <Send size={18} />
              </ActionIcon>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
} 