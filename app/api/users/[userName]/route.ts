import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://miran-hackathon.onrender.com';

// PUT - обновление пользователя
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userName: string }> }
) {
  try {
    const params = await context.params;
    let userName = decodeURIComponent(params.userName);
    // Убираем символ @ из начала userName если он есть
    if (userName.startsWith('@')) {
      userName = userName.substring(1);
    }
    const body = await request.json();
    
    // Убираем @ из user_name в теле запроса, если он есть
    if (body.user_name && body.user_name.startsWith('@')) {
      body.user_name = body.user_name.substring(1);
    }
    if (body.username && body.username.startsWith('@')) {
      body.username = body.username.substring(1);
    }
    
    console.log('[API Proxy] Updating user:', userName);
    console.log('[API Proxy] Request data:', body);
    
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    console.log('[API Proxy] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Proxy] Error response:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to update user: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[API Proxy] Updated user:', data);
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('[API Proxy] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - удаление пользователя
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userName: string }> }
) {
  try {
    const params = await context.params;
    let userName = decodeURIComponent(params.userName);
    // Убираем символ @ из начала userName если он есть
    if (userName.startsWith('@')) {
      userName = userName.substring(1);
    }
    
    console.log('[API Proxy] Deleting user:', userName);
    
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userName)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('[API Proxy] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Proxy] Error response:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to delete user: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    // DELETE может не возвращать тело ответа
    const data = response.status === 204 ? null : await response.json();
    console.log('[API Proxy] User deleted successfully');
    
    return NextResponse.json(
      data || { success: true },
      {
        status: response.status === 204 ? 200 : response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('[API Proxy] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

