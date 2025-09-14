import { useState, useEffect } from "react";
import {
  Title,
  Paper,
  Table,
  Button,
  Group,
  Text,
  Badge,
  Avatar,
  Stack,
  Modal,
  Textarea,
  Box,
  Alert,
  Loader,
  Tabs,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Check, X, AlertCircle } from "lucide-react";
import { getToken } from "@/actions/authentication";


interface SessionRequestsManagerProps {
  onSessionUpdate: () => void;
}

interface SessionRequestWithDetails {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "PENDING" | "ACCEPTED" | "REJECTED";
  studentId: string;
  sessionId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    grade?: string;
    schoolName?: string;
    role: "STUDENT" | "INSTRUCTOR";
  };
  session: {
    id: string;
    name: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    maxAttendees?: number;
    students: { id: string }[];
    subjects: { id: string; name: string }[];
  };
}

export function SessionRequestsManager({ onSessionUpdate }: SessionRequestsManagerProps) {
  const [sessionRequests, setSessionRequests] = useState<SessionRequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SessionRequestWithDetails | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const [rejectModalOpened, { open: openRejectModal, close: closeRejectModal }] = useDisclosure(false);

  // Fetch session requests for the instructor
  const fetchSessionRequests = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/session-requests`,
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
      setError('Failed to load session requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionRequests();
  }, []);

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

      // Refresh the data
      fetchSessionRequests();
      onSessionUpdate();
    } catch (error) {
      console.error('Error accepting session request:', error);
      notifications.show({
        title: "Error",
        message: "Failed to accept session request. Please try again.",
        color: "red",
      });
    }
  };

  const handleRejectRequest = async (requestId: string, reason?: string) => {
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
          body: JSON.stringify({ reason }),
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

      // Reset form and close modal
      setRejectionReason("");
      closeRejectModal();
      
      // Refresh the data
      fetchSessionRequests();
      onSessionUpdate();
    } catch (error) {
      console.error('Error rejecting session request:', error);
      notifications.show({
        title: "Error",
        message: "Failed to reject session request. Please try again.",
        color: "red",
      });
    }
  };

  const handleOpenRejectModal = (request: SessionRequestWithDetails) => {
    setSelectedRequest(request);
    setRejectionReason("");
    openRejectModal();
  };

  // Filter requests by status
  const pendingRequests = sessionRequests.filter(req => req.status === 'PENDING');
  const acceptedRequests = sessionRequests.filter(req => req.status === 'ACCEPTED');
  const rejectedRequests = sessionRequests.filter(req => req.status === 'REJECTED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge color="yellow">Pending</Badge>;
      case 'ACCEPTED':
        return <Badge color="green">Accepted</Badge>;
      case 'REJECTED':
        return <Badge color="red">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <Box ta="center" py="xl">
        <Loader size="lg" />
        <Text mt="md">Loading session requests...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Title order={3} mb="md">Session Requests Management</Title>
      
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
            <Paper p="md">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Student</Table.Th>
                    <Table.Th>Session</Table.Th>
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
                            {request.student.firstName[0]}{request.student.lastName[0]}
                          </Avatar>
                          <Stack gap={0}>
                            <Text size="sm" fw={500}>
                              {request.student.firstName} {request.student.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {request.student.email}
                            </Text>
                            {request.student.grade && (
                              <Text size="xs" c="dimmed">
                                Grade {request.student.grade}
                              </Text>
                            )}
                          </Stack>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={4}>
                          <Text size="sm" fw={500}>
                            {request.session.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatDateTime(request.session.startTime)}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {request.session.students.length}/{request.session.maxAttendees || '∞'} students
                          </Text>
                        </Stack>
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
            </Paper>
          ) : (
            <Paper p="xl" ta="center">
              <Text c="dimmed">No pending session requests.</Text>
            </Paper>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="accepted">
          {acceptedRequests.length > 0 ? (
            <Paper p="md">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Student</Table.Th>
                    <Table.Th>Session</Table.Th>
                    <Table.Th>Accepted</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {acceptedRequests.map((request) => (
                    <Table.Tr key={request.id}>
                      <Table.Td>
                        <Group>
                          <Avatar size="sm" radius="xl">
                            {request.student.firstName[0]}{request.student.lastName[0]}
                          </Avatar>
                          <Stack gap={0}>
                            <Text size="sm" fw={500}>
                              {request.student.firstName} {request.student.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {request.student.email}
                            </Text>
                          </Stack>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={4}>
                          <Text size="sm" fw={500}>
                            {request.session.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatDateTime(request.session.startTime)}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {request.updatedAt ? new Date(request.updatedAt).toLocaleDateString() : 'N/A'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {getStatusBadge(request.status || 'ACCEPTED')}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          ) : (
            <Paper p="xl" ta="center">
              <Text c="dimmed">No accepted session requests.</Text>
            </Paper>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="rejected">
          {rejectedRequests.length > 0 ? (
            <Paper p="md">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Student</Table.Th>
                    <Table.Th>Session</Table.Th>
                    <Table.Th>Rejected</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rejectedRequests.map((request) => (
                    <Table.Tr key={request.id}>
                      <Table.Td>
                        <Group>
                          <Avatar size="sm" radius="xl">
                            {request.student.firstName[0]}{request.student.lastName[0]}
                          </Avatar>
                          <Stack gap={0}>
                            <Text size="sm" fw={500}>
                              {request.student.firstName} {request.student.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {request.student.email}
                            </Text>
                          </Stack>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={4}>
                          <Text size="sm" fw={500}>
                            {request.session.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatDateTime(request.session.startTime)}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {request.updatedAt ? new Date(request.updatedAt).toLocaleDateString() : 'N/A'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {getStatusBadge(request.status || 'REJECTED')}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          ) : (
            <Paper p="xl" ta="center">
              <Text c="dimmed">No rejected session requests.</Text>
            </Paper>
          )}
        </Tabs.Panel>
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
            <strong>{selectedRequest?.student.firstName} {selectedRequest?.student.lastName}</strong>?
          </Text>
          
          <Text size="sm" c="dimmed">
            Optional: Provide a reason for rejection (this will be sent to the student)
          </Text>
          
          <Textarea
            placeholder="Reason for rejection (optional)"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.currentTarget.value)}
            rows={3}
          />
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeRejectModal}>
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={() => selectedRequest && handleRejectRequest(selectedRequest.id, rejectionReason)}
            >
              Reject Request
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
