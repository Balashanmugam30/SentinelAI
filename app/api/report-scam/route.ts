import { NextRequest, NextResponse } from 'next/server';
import { reportNumber } from '@/lib/reputation';
import { analyzeFraud } from '@/lib/fraud-engine';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, description, callType, transcript } = await request.json();

    if (!phoneNumber || !description) {
      return NextResponse.json({ error: 'Phone number and description are required' }, { status: 400 });
    }

    const fraudResult = transcript ? analyzeFraud(transcript) : null;
    const reputation = reportNumber(phoneNumber, callType || 'Unknown');

    const report = {
      reportId: `SR-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
      phoneNumber,
      description,
      callType: callType || 'Unknown',
      transcript: transcript || 'Not available',
      riskScore: fraudResult?.score || 0,
      riskLevel: fraudResult?.riskLevel || 'low',
      scamType: fraudResult?.scamType || 'Unknown',
      reputation,
      timestamp: new Date().toISOString(),
      status: 'submitted',
      evidenceLogs: transcript ? [
        { type: 'transcript', content: transcript, timestamp: new Date().toISOString() },
        { type: 'fraud_analysis', content: JSON.stringify(fraudResult), timestamp: new Date().toISOString() },
      ] : [],
    };

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('Report scam error:', error);
    return NextResponse.json({ error: 'Report submission failed' }, { status: 500 });
  }
}
