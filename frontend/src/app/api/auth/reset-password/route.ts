import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiUrl = process.env.NODE_ENV === 'development' ? 'http://backend:8080' : process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return new NextResponse(JSON.stringify({ error: 'NEXT_PUBLIC_API_URL is not set' }), { status: 500 });
    }
    // Normalize to backend shape (email, code, newPassword) so proxy never drops fields
    const payload = {
      email: typeof body?.email === 'string' ? body.email : body?.email ?? '',
      code: typeof body?.code === 'string' ? body.code : (typeof body?.verificationCode === 'string' ? body.verificationCode : ''),
      newPassword: typeof body?.newPassword === 'string' ? body.newPassword : body?.newPassword ?? '',
    };
    const backendRes = await fetch(`${apiUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await backendRes.text();
    let data: object;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: 'Invalid response from server' };
    }
    return new NextResponse(JSON.stringify(data), { status: backendRes.status });
  } catch (e) {
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function GET() {
  return new NextResponse(JSON.stringify({ message: 'Method not allowed' }), { status: 405 });
} 