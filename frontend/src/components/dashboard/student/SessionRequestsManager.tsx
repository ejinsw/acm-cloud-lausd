import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { getToken } from "@/actions/authentication";
import { SessionRequestsTab } from "./SessionRequestsTab";
import { SessionRequest } from "@/lib/types";

interface SessionRequestsManagerProps {
  sessionRequests: SessionRequest[];
  onSessionRequestsChange: () => void;
}

export function SessionRequestsManager({ 
  sessionRequests, 
  onSessionRequestsChange 
}: SessionRequestsManagerProps) {
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const handleCancelRequest = async (requestId: string) => {
    try {
      setIsCancelling(requestId);
      const token = await getToken();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/session-requests/${requestId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel session request');
      }

      notifications.show({
        title: "Request Cancelled",
        message: "Your session request has been cancelled successfully.",
        color: "green",
      });

      // Refresh the session requests
      onSessionRequestsChange();
    } catch (error) {
      console.error('Error cancelling session request:', error);
      notifications.show({
        title: "Error",
        message: "Failed to cancel session request. Please try again.",
        color: "red",
      });
    } finally {
      setIsCancelling(null);
    }
  };

  return (
    <SessionRequestsTab
      sessionRequests={sessionRequests}
      onCancelRequest={handleCancelRequest}
    />
  );
}
