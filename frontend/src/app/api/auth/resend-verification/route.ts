import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiUrl = process.env.NODE_ENV === 'development' ? 'http://backend:8080' : process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not set');
    }
    const backendRes = await fetch(`${apiUrl}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await backendRes.json();
    return new NextResponse(JSON.stringify(data), { status: backendRes.status });
  } catch {
    return new NextResponse(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}

export async function GET() {
  return new NextResponse(JSON.stringify({ message: 'Method not allowed' }), { status: 405 });
} 