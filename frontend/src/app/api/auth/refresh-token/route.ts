import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token found' }, { status: 401 });
    }

    // Call the backend API to refresh the token
    const apiUrl = process.env.NODE_ENV === 'development' ? 'http://backend:8080' : process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
    }
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Refresh failed, clear tokens
      const errorResponse = NextResponse.json({ error: 'Token refresh failed' }, { status: 401 });
      errorResponse.cookies.delete('accessToken');
      errorResponse.cookies.delete('refreshToken');
      return errorResponse;
    }

    const data = await response.json();

    // Set new tokens in cookies
    const successResponse = NextResponse.json({ accessToken: data.accessToken });
    successResponse.cookies.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 1, // 1 day
    });

    if (data.refreshToken) {
      successResponse.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days (1 month)
      });
    }

    return successResponse;
  } catch (error) {
    console.error('Refresh token route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 