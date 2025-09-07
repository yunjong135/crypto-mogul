import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[Game Health] GET request received');
  
  return NextResponse.json({
    status: 'ok',
    message: 'Game service is running',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  console.log('[Game Health] POST request received');
  return GET();
}