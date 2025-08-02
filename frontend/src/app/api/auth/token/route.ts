import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }

    // Check if token is expired
    try {
      const tokenData = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenData.exp < currentTime) {
        // Token is expired, try to refresh
        if (refreshToken) {
          const apiUrl = process.env.NODE_ENV === 'development' ? 'http://backend:8080' : process.env.NEXT_PUBLIC_API_URL;
          const refreshResponse = await fetch(`${apiUrl}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            
            // Set new tokens in cookies
            const response = NextResponse.json({ token: refreshData.accessToken });
            response.cookies.set('accessToken', refreshData.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            
            if (refreshData.refreshToken) {
              response.cookies.set('refreshToken', refreshData.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30, // 30 days
              });
            }
            
            return response;
          }
        }
        
        // Refresh failed, clear tokens
        const response = NextResponse.json({ error: 'Token expired' }, { status: 401 });
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
      }
    } catch {
      // Invalid token format
      const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }

    return NextResponse.json({ token: accessToken });
  } catch (error) {
    console.error('Token route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 