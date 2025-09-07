import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[Game Balance] GET request received');
  
  return NextResponse.json({
    ok: true,
    user: {
      id: 'mock-user-id',
      tg_user_id: 'mock-tg-user-id',
      username: 'mock-user',
      balance: 1000
    }
  });
}

export async function POST() {
  console.log('[Game Balance] POST request received');
  return GET();
}