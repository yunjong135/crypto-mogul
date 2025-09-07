import { NextResponse } from 'next/server';

export async function POST() {
  console.log('[Trade Buy] POST request received');
  
  return NextResponse.json({
    ok: true,
    message: 'Trade executed successfully',
    transaction_id: 'mock-tx-' + Date.now()
  });
}

export async function GET() {
  console.log('[Trade Buy] GET request received');
  return POST();
}