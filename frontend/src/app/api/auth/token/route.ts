import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken");
    
    // Debug: log all available cookies
    const allCookies = cookieStore.getAll();
    console.log('All cookies:', allCookies.map(c => ({ name: c.name, value: c.value ? '***' : 'undefined' })));
    console.log('Access token cookie:', token ? 'found' : 'not found');
    
    if (!token) {
      return NextResponse.json({ 
        token: null, 
        message: 'No access token found',
        availableCookies: allCookies.map(c => c.name)
      }, { status: 401 });
    }
    
    return NextResponse.json({ token: token.value });
  } catch (error) {
    console.error('Error getting token:', error);
    return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
  }
} 