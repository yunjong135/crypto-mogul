import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[Stocks History] GET request received');
  
  return NextResponse.json([
    { timestamp: Date.now() - 3600000, price: 95 },
    { timestamp: Date.now() - 1800000, price: 98 },
    { timestamp: Date.now(), price: 100 }
  ]);
}

export async function POST() {
  console.log('[Stocks History] POST request received');
  return GET();
}