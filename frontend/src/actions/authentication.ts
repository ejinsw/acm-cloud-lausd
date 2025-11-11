export async function getToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include', // Ensure cookies are sent
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      return null;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Token fetch failed:', response.status, errorData);
      return null;
    }
    
    const data = await response.json();
    return data.token || null;
  } catch (error) {
    console.error('Error fetching token:', error);
    // Don't throw, just return null to allow graceful degradation
    return null;
  }
}

export async function refreshToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    // Call logout endpoint to clear cookies
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error during logout:', error);
    // Even if the API call fails, we should continue with logout
  }
}