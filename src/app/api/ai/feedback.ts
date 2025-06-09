import { NextRequest, NextResponse } from 'next/server';
import { recordSuggestionOutcome, getAcceptanceRates } from '@/app/workflows/AI_improvement/functions/abTesting';

export async function POST(req: NextRequest) {
  const { userId, accepted } = await req.json();
  if (!userId || typeof accepted !== 'boolean') {
    return NextResponse.json({ error: 'userId and accepted (boolean) are required' }, { status: 400 });
  }
  recordSuggestionOutcome(userId, accepted);
  const rates = getAcceptanceRates();
  return NextResponse.json({
    userId,
    accepted,
    acceptanceRates: rates,
  });
} 