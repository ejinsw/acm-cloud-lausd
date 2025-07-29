export async function getToken(): Promise<string | null> {
  try {
    console.log('Fetching token from /api/auth/token...');
    const response = await fetch('/api/auth/token');
    console.log('Response status:', response.status);
    
    // 401 is expected when no token exists
    if (response.status === 401) {
      console.log('No access token found - user not authenticated');
      return null;
    }
    
    if (!response.ok) {
      console.log('Unexpected error response:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('Token response:', data);
    return data.token;
  } catch (error) {
    console.error('Error fetching token:', error);
    return null;
  }
}