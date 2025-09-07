import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[Stocks List] GET request received');
  
  return NextResponse.json([
    { symbol: 'NVSL', price: 100, change: 5.2, changePercent: 5.5 },
    { symbol: 'TSLA', price: 250, change: -10.5, changePercent: -4.0 },
    { symbol: 'AAPL', price: 180, change: 2.1, changePercent: 1.2 }
  ]);
}

export async function POST() {
  console.log('[Stocks List] POST request received');
  return GET();
}