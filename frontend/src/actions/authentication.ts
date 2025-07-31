export async function getToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token');
    if (response.status === 401) {
      return null;
    }
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error fetching token:', error);
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
    // Clear tokens from storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    }
    
    // Call logout endpoint
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error during logout:', error);
  }
}