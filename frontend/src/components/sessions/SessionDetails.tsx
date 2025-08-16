"use client";

import { useState, useEffect } from 'react';
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
  Modal,
  Select,
  Table,
  Loader,
  Box,
} from '@mantine/core';
import { Target, Book, Check, Edit, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { Session, SessionRequest } from '@/lib/types';
import { routes } from '@/app/routes';
import { useAuth } from '@/components/AuthProvider';
import { getToken } from '@/actions/authentication';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';

interface SessionDetailsProps {
  session: Session;
}

export function SessionDetails({ session: initialSession }: SessionDetailsProps) {
  const { user } = useAuth();
  
  // Local state for session to allow updates without page refresh
  const [session, setSession] = useState(initialSession);
  
  // Check if current user is the instructor of this session
  const isSessionOwner = user?.role === 'INSTRUCTOR' && user?.id === session.instructorId;
  
  // Check if current user is an instructor but not the owner
  const isOtherInstructor = user?.role === 'INSTRUCTOR' && !isSessionOwner;

  // State for session request management
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SessionRequest | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const [rejectModalOpened, { open: openRejectModal, close: closeRejectModal }] = useDisclosure(false);

  // Fetch session requests for this session
  const fetchSessionRequests = async () => {
    if (!isSessionOwner) return;
    
    setIsLoadingRequests(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/session-requests?sessionId=${session.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch session requests');
      }

      const data = await response.json();
      setSessionRequests(data.sessionRequests || []);
    } catch (err) {
      console.error('Error fetching session requests:', err);
      notifications.show({
        title: "Error",
        message: "Failed to load session requests.",
        color: "red",
      });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Load session requests when component mounts
  useEffect(() => {
    if (isSessionOwner) {
      fetchSessionRequests();
    }
  }, [isSessionOwner, session.id]);

  // Handle accepting session requests
  const handleAcceptRequest = async (requestId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/session-requests/${requestId}/accept`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to accept session request');
      }

      notifications.show({
        title: "Request Accepted",
        message: "Session request has been accepted successfully.",
        color: "green",
      });

      // Refresh the session requests
      fetchSessionRequests();
    } catch (error) {
      console.error('Error accepting session request:', error);
      notifications.show({
        title: "Error",
        message: "Failed to accept session request. Please try again.",
        color: "red",
      });
    }
  };

  // Handle rejecting session requests
  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/session-requests/${requestId}/reject`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject session request');
      }

      notifications.show({
        title: "Request Rejected",
        message: "Session request has been rejected successfully.",
        color: "yellow",
      });

      // Close modal
      closeRejectModal();
      
      // Refresh the session requests
      fetchSessionRequests();
    } catch (error) {
      console.error('Error rejecting session request:', error);
      notifications.show({
        title: "Error",
        message: "Failed to reject session request. Please try again.",
        color: "red",
      });
    }
  };

  // Handle session status changes
  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${session.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update session status');
      }

      notifications.show({
        title: "Status Updated",
        message: `Session status has been updated to ${newStatus}.`,
        color: "green",
      });

      // Refresh the page or update the session data
      window.location.reload();
    } catch (error) {
      console.error('Error updating session status:', error);
      notifications.show({
        title: "Error",
        message: "Failed to update session status. Please try again.",
        color: "red",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle changing student status (accepted to rejected or vice versa)
  const handleChangeStudentStatus = async (studentId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    try {
      const token = await getToken();
      
      // Find the session request for this student and session
      const sessionRequest = sessionRequests.find(
        request => request.studentId === studentId && request.sessionId === session.id
      );
      
      if (!sessionRequest) {
        notifications.show({
          title: "Error",
          message: "Session request not found for this student.",
          color: "red",
        });
        return;
      }

      if (newStatus === 'REJECTED') {
        // Reject the session request (this will remove the student from the session)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/session-requests/${sessionRequest.id}/reject`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to reject session request');
        }

        const result = await response.json();

        notifications.show({
          title: "Student Removed",
          message: "Student has been removed from the session.",
          color: "yellow",
        });

        // Update local state without page refresh
        if (result.session) {
          setSession(result.session);
        }
        
        // Update the session requests state
        setSessionRequests(prev => 
          prev.map(req => 
            req.id === sessionRequest.id 
              ? { ...req, status: 'REJECTED' as const }
              : req
          )
        );

      } else {
        // Accept the session request (this will add the student back to the session)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/session-requests/${sessionRequest.id}/accept`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to accept session request');
        }

        const result = await response.json();

        notifications.show({
          title: "Student Added",
          message: "Student has been added back to the session.",
          color: "green",
        });

        // Update local state without page refresh
        if (result.session) {
          setSession(result.session);
        }
        
        // Update the session requests state
        setSessionRequests(prev => 
          prev.map(req => 
            req.id === sessionRequest.id 
              ? { ...req, status: 'ACCEPTED' as const }
              : req
          )
        );
      }
    } catch (error) {
      console.error('Error changing student status:', error);
      notifications.show({
        title: "Error",
        message: "Failed to change student status. Please try again.",
        color: "red",
      });
    }
  };

  // Open rejection modal
  const handleOpenRejectModal = (request: SessionRequest) => {
    setSelectedRequest(request);
    openRejectModal();
  };

  // Filter requests by status
  const pendingRequests = sessionRequests.filter(req => req.status === 'PENDING');
  const acceptedRequests = sessionRequests.filter(req => req.status === 'ACCEPTED');
  const rejectedRequests = sessionRequests.filter(req => req.status === 'REJECTED');

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Tabs defaultValue="details">
        <Tabs.List>
          <Tabs.Tab value="details">Details</Tabs.Tab>
          {/* Only show instructor tab if there's an instructor and user is not the instructor */}
          {session.instructor && (user?.role === 'STUDENT' || isOtherInstructor) && (
          <Tabs.Tab value="instructor">Instructor</Tabs.Tab>
          )}
          {/* Show management tab for session owner */}
          {isSessionOwner && (
            <Tabs.Tab value="management">Management</Tabs.Tab>
          )}
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
          </Stack>
        </Tabs.Panel>

        {/* Only show instructor tab panel if there's an instructor and user is not the instructor */}
        {session.instructor && (user?.role === 'STUDENT' || isOtherInstructor) && (
        <Tabs.Panel value="instructor" pt="md">
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
              
              {/* Only show instructor profile button if user is not the instructor or if they're a student */}
              {(user?.role === 'STUDENT' || isOtherInstructor) && (
              <Button 
                component={Link} 
                href={routes.instructorProfile(session.instructor.id)}
                variant="outline"
                mt="md"
              >
                View Instructor Profile
              </Button>
              )}
            </>
          </Tabs.Panel>
        )}

        {/* Management tab for session owner */}
        {isSessionOwner && (
          <Tabs.Panel value="management" pt="md">
            <Stack gap="md">
              <Title order={3}>Session Management</Title>
              
              {/* Quick Actions */}
              <Paper p="md" withBorder radius="md">
                <Text fw={500} mb="xs">Quick Actions</Text>
                <Group>
                  <Button 
                    component={Link} 
                    href={routes.editSession(session.id)}
                    leftSection={<Edit size={16} />}
                    variant="outline"
                  >
                    Edit Session
                  </Button>
                  <Button 
                    component={Link} 
                    href={routes.instructorDashboard}
                    leftSection={<Settings size={16} />}
                    variant="outline"
                  >
                    Go to Dashboard
                  </Button>
                </Group>
              </Paper>
              
              {/* Session Status Management */}
              <Paper p="md" withBorder radius="md">
                <Text fw={500} mb="xs">Session Status</Text>
                <Group align="flex-end">
                  <Select
                    label="Change Status"
                    value={session.status || 'SCHEDULED'}
                    onChange={(value) => value && handleStatusChange(value)}
                    data={[
                      { value: 'SCHEDULED', label: 'Scheduled' },
                      { value: 'IN_PROGRESS', label: 'In Progress' },
                      { value: 'COMPLETED', label: 'Completed' },
                      { value: 'CANCELLED', label: 'Cancelled' },
                    ]}
                    disabled={isUpdatingStatus}
                    style={{ minWidth: 200 }}
                  />
                  {isUpdatingStatus && <Loader size="sm" />}
                </Group>
                <Group mt="xs">
                  <Badge 
                    size="lg" 
                    color={
                      session.status === 'SCHEDULED' ? 'blue' : 
                      session.status === 'IN_PROGRESS' ? 'green' : 
                      session.status === 'COMPLETED' ? 'gray' : 'red'
                    }
                  >
                    {session.status || 'SCHEDULED'}
                  </Badge>
                  {session.startTime && (
                    <Text size="sm">
                      Starts: {new Date(session.startTime).toLocaleString()}
                    </Text>
                  )}
                </Group>
              </Paper>
              
              {/* Session Requests Management */}
              <Paper p="md" withBorder radius="md">
                <Title order={4} mb="md">Session Requests</Title>
                
                {isLoadingRequests ? (
                  <Box ta="center" py="xl">
                    <Loader size="lg" />
                    <Text mt="md">Loading session requests...</Text>
                  </Box>
                ) : (
                  <Tabs defaultValue="pending">
                    <Tabs.List mb="md">
                      <Tabs.Tab 
                        value="pending" 
                        rightSection={<Badge size="xs">{pendingRequests.length}</Badge>}
                      >
                        Pending
                      </Tabs.Tab>
                      <Tabs.Tab 
                        value="accepted" 
                        rightSection={<Badge size="xs">{acceptedRequests.length}</Badge>}
                      >
                        Accepted
                      </Tabs.Tab>
                      <Tabs.Tab 
                        value="rejected" 
                        rightSection={<Badge size="xs">{rejectedRequests.length}</Badge>}
                      >
                        Rejected
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="pending">
                      {pendingRequests.length > 0 ? (
                        <Table>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Student</Table.Th>
                              <Table.Th>Requested</Table.Th>
                              <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {pendingRequests.map((request) => (
                              <Table.Tr key={request.id}>
                                <Table.Td>
                                  <Group>
                                    <Avatar size="sm" radius="xl">
                                      {request.student?.firstName?.[0]}{request.student?.lastName?.[0]}
                                    </Avatar>
                                    <Stack gap={0}>
                                      <Text size="sm" fw={500}>
                                        {request.student?.firstName} {request.student?.lastName}
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        {request.student?.email}
                                      </Text>
                                    </Stack>
                                  </Group>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs" c="dimmed">
                                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Group gap="xs">
                                    <Button
                                      size="xs"
                                      color="green"
                                      leftSection={<Check size={14} />}
                                      onClick={() => handleAcceptRequest(request.id)}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="xs"
                                      color="red"
                                      variant="outline"
                                      leftSection={<X size={14} />}
                                      onClick={() => handleOpenRejectModal(request)}
                                    >
                                      Reject
                                    </Button>
                                  </Group>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      ) : (
                        <Text c="dimmed" ta="center">No pending session requests.</Text>
                      )}
                    </Tabs.Panel>

                    <Tabs.Panel value="accepted">
                      {acceptedRequests.length > 0 ? (
                        <Table>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Student</Table.Th>
                              <Table.Th>Accepted</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {acceptedRequests.map((request) => (
                              <Table.Tr key={request.id}>
                                <Table.Td>
                                  <Group>
                                    <Avatar size="sm" radius="xl">
                                      {request.student?.firstName?.[0]}{request.student?.lastName?.[0]}
                                    </Avatar>
                                    <Stack gap={0}>
                                      <Text size="sm" fw={500}>
                                        {request.student?.firstName} {request.student?.lastName}
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        {request.student?.email}
                                      </Text>
                                    </Stack>
                                  </Group>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="xs" c="dimmed">
                                    {request.updatedAt ? new Date(request.updatedAt).toLocaleDateString() : 'N/A'}
                                  </Text>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      ) : (
                        <Text c="dimmed" ta="center">No accepted session requests.</Text>
          )}
        </Tabs.Panel>

                    <Tabs.Panel value="rejected">
                      {rejectedRequests.length > 0 ? (
                        <Table>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Student</Table.Th>
                              <Table.Th>Rejected</Table.Th>
                              <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {rejectedRequests.map((request) => (
                              <Table.Tr key={request.id}>
                                <Table.Td>
                                  <Group>
                                    <Avatar size="sm" radius="xl">
                                      {request.student?.firstName?.[0]}{request.student?.lastName?.[0]}
                                    </Avatar>
                                    <Stack gap={0}>
                                      <Text size="sm" fw={500}>
                                        {request.student?.firstName} {request.student?.lastName}
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        {request.student?.email}
                                      </Text>
                                    </Stack>
                                  </Group>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm" c="dimmed">
                                    {request.updatedAt ? new Date(request.updatedAt).toLocaleDateString() : 'N/A'}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Button
                                    size="xs"
                                    color="green"
                                    leftSection={<Check size={12} />}
                                    onClick={() => handleChangeStudentStatus(request.studentId, 'ACCEPTED')}
                                    title="Re-accept student"
                                  >
                                    Re-accept
                                  </Button>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      ) : (
                        <Text c="dimmed" ta="center">No rejected session requests.</Text>
                      )}
                    </Tabs.Panel>
                  </Tabs>
                )}
              </Paper>
              
              {/* Enrolled Students */}
              {session.students && session.students.length > 0 && (
                <Paper p="md" withBorder radius="md">
                  <Text fw={500} mb="xs">Enrolled Students ({session.students.length})</Text>
                  <Stack gap="xs">
                    {session.students.map((student) => (
                      <Group key={student.id} gap="xs" justify="space-between">
                        <Group gap="xs">
                          <Avatar size="sm" radius="xl">
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </Avatar>
                          <Stack gap={0}>
                            <Text size="sm" fw={500}>
                              {student.firstName} {student.lastName}
                            </Text>
                            {student.email && (
                              <Text size="xs" c="dimmed">
                                {student.email}
                              </Text>
                            )}
                          </Stack>
                        </Group>
                        
                        {/* Status Management Buttons */}
                        <Group gap="xs">
                          <Button
                            size="xs"
                            color="red"
                            variant="outline"
                            leftSection={<X size={12} />}
                            onClick={() => handleChangeStudentStatus(student.id, 'REJECTED')}
                            title="Remove student from session"
                          >
                            Remove
                          </Button>
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Tabs.Panel>
        )}


      </Tabs>

      {/* Rejection Reason Modal */}
      <Modal
        opened={rejectModalOpened}
        onClose={closeRejectModal}
        title="Reject Session Request"
        centered
      >
        <Stack>
          <Text size="sm">
            Are you sure you want to reject the session request from{" "}
            <strong>{selectedRequest?.student?.firstName} {selectedRequest?.student?.lastName}</strong>?
          </Text>
          

          
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeRejectModal}>
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={() => selectedRequest && handleRejectRequest(selectedRequest.id)}
            >
              Reject Request
            </Button>
          </Group>
        </Stack>
      </Modal>


    </Card>
  );
} 