import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://miran-hackathon.onrender.com';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Отключаем кеширование для получения актуальных данных
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Proxy] Error response:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch users: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[API Proxy] Received users:', data.length, 'items');
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('[API Proxy] Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users from API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

