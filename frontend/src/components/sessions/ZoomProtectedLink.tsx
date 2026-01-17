"use client";

import React from 'react';
import { Button, ButtonProps } from '@mantine/core';
import { useZoomStatus } from '@/hooks/useZoomStatus';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

interface ZoomProtectedLinkProps extends ButtonProps {
  href: string;
  children: React.ReactNode;
  requireZoom?: boolean;
}

/**
 * A button/link component that checks Zoom status before navigation
 * Shows a notification if Zoom is not connected and redirects to Zoom setup
 */
export function ZoomProtectedLink({ 
  href, 
  children, 
  requireZoom = true,
  onClick,
  ...buttonProps 
}: ZoomProtectedLinkProps) {
  const { connected, expired, isLoading } = useZoomStatus();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // If Zoom is not required, just navigate normally
    if (!requireZoom) {
      if (onClick) {
        onClick(e);
      } else {
        router.push(href);
      }
      return;
    }

    // Check Zoom connection
    if (!isLoading && (!connected || expired)) {
      e.preventDefault();
      e.stopPropagation();
      
      notifications.show({
        title: 'Zoom Account Required',
        message: expired 
          ? 'Your Zoom connection has expired. Please reconnect to continue.'
          : 'You must connect your Zoom account before performing this action.',
        color: 'yellow',
        autoClose: 5000,
      });
      
      // Redirect to Zoom setup
      router.push('/dashboard/instructor?tab=zoom');
      return;
    }

    // Zoom is connected, proceed with navigation or custom onClick
    if (onClick) {
      onClick(e);
    } else {
      router.push(href);
    }
  };

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      disabled={buttonProps.disabled || (requireZoom && isLoading)}
    >
      {children}
    </Button>
  );
}
