import { NextResponse } from 'next/server';

export async function POST() {
  console.log('[Game Bet] POST request received');
  
  // Always return a successful response for now
  return NextResponse.json({
    ok: true,
    bet: {
      id: 'mock-bet-' + Date.now(),
      choice: 'S',
      amount: 100,
      commit_hash: 'mock-commit-hash'
    },
    commit_hash: 'mock-commit-hash'
  });
}

export async function GET() {
  console.log('[Game Bet] GET request received');
  return POST();
}