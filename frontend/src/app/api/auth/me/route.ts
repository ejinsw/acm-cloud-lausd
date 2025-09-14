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
        // Token is invalid, try to refresh it first
        const refreshToken = cookieStore.get('refreshToken')?.value;
        
        if (refreshToken) {
          try {
            // Attempt to refresh the token
            const refreshResponse = await fetch(`${apiUrl}/api/auth/refresh-token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              
              // Try the original request again with the new token
              const retryResponse = await fetch(`${apiUrl}/api/auth/me`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${refreshData.accessToken}`,
                  'Content-Type': 'application/json',
                },
              });

              if (retryResponse.ok) {
                const userData = await retryResponse.json();
                const successResponse = NextResponse.json(userData);
                
                // Set the new access token in cookies
                successResponse.cookies.set('accessToken', refreshData.accessToken, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                  maxAge: 60 * 60 * 24 * 3, // 3 days
                });
                
                return successResponse;
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }
        
        // If refresh failed or no refresh token, clear cookies and return error
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