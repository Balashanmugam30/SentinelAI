// SentinelAI Scam Number Reputation System

export interface NumberReputation {
  phoneNumber: string;
  reportCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  lastReported: string;
  scamTypes: string[];
}

// Mock database
const reputationDB: Map<string, NumberReputation> = new Map([
  ['+91 98765 43210', { phoneNumber: '+91 98765 43210', reportCount: 42, riskLevel: 'critical', riskScore: 95, lastReported: '2024-12-15', scamTypes: ['Bank OTP Scam', 'KYC Scam'] }],
  ['+91 87654 32109', { phoneNumber: '+91 87654 32109', reportCount: 28, riskLevel: 'high', riskScore: 78, lastReported: '2024-12-14', scamTypes: ['UPI Scam'] }],
  ['+91 76543 21098', { phoneNumber: '+91 76543 21098', reportCount: 15, riskLevel: 'medium', riskScore: 55, lastReported: '2024-12-12', scamTypes: ['Loan Scam'] }],
  ['+91 65432 10987', { phoneNumber: '+91 65432 10987', reportCount: 67, riskLevel: 'critical', riskScore: 98, lastReported: '2024-12-15', scamTypes: ['Tech Support Scam', 'Phishing'] }],
  ['+91 54321 09876', { phoneNumber: '+91 54321 09876', reportCount: 8, riskLevel: 'medium', riskScore: 42, lastReported: '2024-12-10', scamTypes: ['Prize Scam'] }],
  ['+91 43210 98765', { phoneNumber: '+91 43210 98765', reportCount: 3, riskLevel: 'low', riskScore: 15, lastReported: '2024-12-08', scamTypes: ['Unknown'] }],
]);

export function getReputation(phoneNumber: string): NumberReputation | undefined {
  return reputationDB.get(phoneNumber);
}

export function reportNumber(phoneNumber: string, scamType: string): NumberReputation {
  const existing = reputationDB.get(phoneNumber);
  if (existing) {
    existing.reportCount += 1;
    existing.riskScore = Math.min(existing.riskScore + 5, 100);
    existing.lastReported = new Date().toISOString().split('T')[0];
    if (!existing.scamTypes.includes(scamType)) {
      existing.scamTypes.push(scamType);
    }
    existing.riskLevel =
      existing.riskScore >= 80 ? 'critical' :
      existing.riskScore >= 60 ? 'high' :
      existing.riskScore >= 30 ? 'medium' : 'low';
    reputationDB.set(phoneNumber, existing);
    return existing;
  }

  const newEntry: NumberReputation = {
    phoneNumber,
    reportCount: 1,
    riskLevel: 'low',
    riskScore: 20,
    lastReported: new Date().toISOString().split('T')[0],
    scamTypes: [scamType],
  };
  reputationDB.set(phoneNumber, newEntry);
  return newEntry;
}

export function getAllReputations(): NumberReputation[] {
  return Array.from(reputationDB.values()).sort((a, b) => b.riskScore - a.riskScore);
}
