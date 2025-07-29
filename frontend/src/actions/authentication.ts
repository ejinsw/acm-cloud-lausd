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