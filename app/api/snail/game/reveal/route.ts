import { NextResponse } from 'next/server';

export async function POST() {
  console.log('[Game Reveal] POST request received');
  
  return NextResponse.json({
    ok: true,
    winner: 'S',
    payout: 250,
    revealed: true
  });
}

export async function GET() {
  console.log('[Game Reveal] GET request received');
  return POST();
}