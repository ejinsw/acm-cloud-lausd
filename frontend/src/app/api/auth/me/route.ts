import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }

    // Call the backend API to get user information
    const apiUrl = process.env.NODE_ENV === 'development' ? 'http://backend:8080' : process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, clear cookies
        const errorResponse = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        errorResponse.cookies.delete('accessToken');
        errorResponse.cookies.delete('refreshToken');
        return errorResponse;
      }
      
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch user data' },
        { status: response.status }
      );
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Me route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 