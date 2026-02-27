import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiUrl = process.env.NODE_ENV === 'development' ? 'http://backend:8080' : process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not set');
    }

    const contentType = req.headers.get('content-type') || '';
    let backendRes: Response;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      backendRes = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        body: formData,
      });
    } else {
      const body = await req.json();
      backendRes = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    }

    const responseText = await backendRes.text();
    const responseContentType = backendRes.headers.get('content-type') || 'application/json';

    return new NextResponse(responseText, {
      status: backendRes.status,
      headers: {
        'Content-Type': responseContentType,
      },
    });
  } catch (error) {
    console.error("Sign-up API error:", error);
    return new NextResponse(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}

export async function GET() {
  return new NextResponse(JSON.stringify({ message: 'Method not allowed' }), { status: 405 });
} 
