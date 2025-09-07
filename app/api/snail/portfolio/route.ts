import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[Portfolio] GET request received');
  
  // Always return a successful response for now
  return NextResponse.json({
    ok: true,
    cash: 1000,
    portfolio_value: 0,
    cost_basis: 0,
    pnl: 0,
    pnl_rate: 0,
    positions: []
  });
}

export async function POST() {
  console.log('[Portfolio] POST request received');
  return GET();
}