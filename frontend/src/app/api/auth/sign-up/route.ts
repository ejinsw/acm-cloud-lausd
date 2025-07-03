import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  
  try {
    const body = await req.json();

    const backendRes = await fetch(`http://backend:8080/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await backendRes.json();
    
    return new NextResponse(JSON.stringify(data), { status: backendRes.status });
  } catch (error) {
    console.error("Sign-up API error:", error);
    return new NextResponse(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}

export async function GET() {
  return new NextResponse(JSON.stringify({ message: 'Method not allowed' }), { status: 405 });
} 