import { NextRequest, NextResponse } from 'next/server';
import { analyzeFraud } from '@/lib/fraud-engine';

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const result = analyzeFraud(transcript);

    return NextResponse.json({
      success: true,
      data: {
        score: result.score,
        riskLevel: result.riskLevel,
        triggers: result.triggers,
        scamType: result.scamType,
      },
    });
  } catch (error) {
    console.error('Fraud score error:', error);
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 });
  }
}
