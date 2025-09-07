import { NextResponse } from 'next/server';

export async function POST() {
  console.log('[Game Init] POST request received');
  
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

export async function GET() {
  console.log('[Game Init] GET request received');
  return POST();
}