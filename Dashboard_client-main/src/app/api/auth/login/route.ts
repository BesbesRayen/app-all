import { NextResponse } from 'next/server';

const SPRING_BOOT_URL = process.env.BACKEND_URL ?? 'http://localhost:8081';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${SPRING_BOOT_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('❌ Login proxy error:', error);
    return NextResponse.json(
      { message: 'Erreur de connexion au serveur.' },
      { status: 500 }
    );
  }
}