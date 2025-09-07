import { NextResponse } from 'next/server';

export async function POST() {
  console.log('[Trade Sell] POST request received');
  
  return NextResponse.json({
    ok: true,
    message: 'Trade executed successfully',
    transaction_id: 'mock-tx-' + Date.now()
  });
}

export async function GET() {
  console.log('[Trade Sell] GET request received');
  return POST();
}