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
      // Validate token format before parsing
      const tokenParts = accessToken.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const tokenData = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenData.exp && tokenData.exp < currentTime) {
        // Token is expired, try to refresh
        if (refreshToken) {
          try {
            const apiUrl = process.env.NODE_ENV === 'development' 
              ? 'http://backend:8080' 
              : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            
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
                maxAge: 60 * 60 * 24 * 1, // 1 day
              });
              
              if (refreshData.refreshToken) {
                response.cookies.set('refreshToken', refreshData.refreshToken, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                  maxAge: 60 * 60 * 24 * 30, // 30 days (1 month)
                });
              }
              
              return response;
            }
          } catch (refreshError) {
            console.error('Token refresh error:', refreshError);
            // Continue to return expired token error
          }
        }
        
        // Refresh failed or no refresh token, clear tokens
        const response = NextResponse.json({ error: 'Token expired' }, { status: 401 });
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
      }
    } catch (parseError) {
      // Invalid token format
      console.error('Token parse error:', parseError);
      const response = NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }

    return NextResponse.json({ token: accessToken });
  } catch (error) {
    console.error('Token route error:', error);
    // Always return a response, even on error
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 