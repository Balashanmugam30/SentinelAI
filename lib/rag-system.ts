// SentinelAI RAG Knowledge Base
// Retrieval-Augmented Generation for scam pattern matching

export interface ScamPattern {
  id: string;
  type: string;
  title: string;
  description: string;
  keywords: string[];
  indicators: string[];
  preventionTips: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const SCAM_KNOWLEDGE_BASE: ScamPattern[] = [
  {
    id: 'bank-otp',
    type: 'Bank OTP Scam',
    title: 'Bank OTP / Verification Code Scam',
    description: 'Scammers impersonate bank officials and urgently request OTP or verification codes, claiming account issues or suspicious transactions. They use the OTP to drain bank accounts.',
    keywords: ['otp', 'verification code', 'bank', 'account blocked', 'suspicious transaction', 'share code'],
    indicators: ['Caller claims to be from bank', 'Urgently requests OTP', 'Threatens account suspension', 'Asks for card details'],
    preventionTips: ['Banks never ask for OTP over phone', 'Hang up and call your bank directly', 'Never share OTP with anyone', 'Report to bank fraud department'],
    severity: 'critical',
  },
  {
    id: 'upi-scam',
    type: 'UPI Scam',
    title: 'UPI Payment Fraud',
    description: 'Fraudsters trick victims into approving UPI payment requests disguised as receiving money. They send collect requests or share fake payment screenshots.',
    keywords: ['upi', 'google pay', 'phonepe', 'paytm', 'collect request', 'payment link', 'qr code'],
    indicators: ['Asks to scan QR code to "receive" money', 'Sends collect request instead of payment', 'Shares fake payment screenshot'],
    preventionTips: ['You never need to enter PIN to receive money', 'Verify payment in your bank app', 'Don\'t scan QR codes from unknown sources'],
    severity: 'high',
  },
  {
    id: 'loan-scam',
    type: 'Loan Scam',
    title: 'Loan & Credit Fraud',
    description: 'Fake loan offers demanding advance processing fees, registration charges, or insurance payments before disbursing a loan that never arrives.',
    keywords: ['loan', 'pre-approved', 'processing fee', 'registration', 'advance payment', 'low interest', 'instant loan'],
    indicators: ['Unsolicited loan offer', 'Demands advance payment', 'Too-good-to-be-true interest rates', 'No physical office or verification'],
    preventionTips: ['Legitimate lenders don\'t charge upfront fees', 'Verify lender registration with RBI', 'Check for physical office address', 'Read reviews and complaints'],
    severity: 'high',
  },
  {
    id: 'kyc-scam',
    type: 'KYC Scam',
    title: 'Fake KYC Verification',
    description: 'Scammers pose as telecom, bank, or wallet representatives demanding KYC updates. They request Aadhaar, PAN, or debit card details to steal identity.',
    keywords: ['kyc', 'aadhaar', 'pan card', 'verify identity', 'update kyc', 'account locked', 'sim block'],
    indicators: ['Threatens service disconnection', 'Asks for Aadhaar or PAN details', 'Requests app installation', 'Claims KYC expiry'],
    preventionTips: ['KYC is done in person at official centers', 'Never share documents over phone', 'Contact service provider directly'],
    severity: 'critical',
  },
  {
    id: 'tech-support',
    type: 'Tech Support Scam',
    title: 'Technical Support Fraud',
    description: 'Callers claim your device is infected or compromised, demanding remote access through apps like AnyDesk or TeamViewer to steal data and money.',
    keywords: ['virus', 'malware', 'remote access', 'anydesk', 'teamviewer', 'screen share', 'infected', 'tech support'],
    indicators: ['Unsolicited call about device issues', 'Requests remote access installation', 'Claims Microsoft/Apple affiliation', 'Demands payment to "fix" issues'],
    preventionTips: ['Microsoft/Apple never make unsolicited calls', 'Never install remote access apps for strangers', 'Your device is likely fine', 'Hang up immediately'],
    severity: 'high',
  },
  {
    id: 'phishing',
    type: 'Phishing Attack',
    title: 'Phishing & Social Engineering',
    description: 'Attackers send fraudulent messages or calls pretending to be from trusted organizations, tricking victims into revealing credentials or clicking malicious links.',
    keywords: ['click link', 'verify account', 'password', 'login', 'suspicious activity', 'confirm details', 'update information'],
    indicators: ['Generic greeting', 'Suspicious URL or link', 'Requests login credentials', 'Creates false urgency'],
    preventionTips: ['Check sender email/number carefully', 'Don\'t click unknown links', 'Navigate to official website directly', 'Enable 2-factor authentication'],
    severity: 'high',
  },
];

export function findSimilarScams(transcript: string): ScamPattern[] {
  const text = transcript.toLowerCase();
  const matches: { pattern: ScamPattern; score: number }[] = [];

  for (const pattern of SCAM_KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    if (score > 0) {
      matches.push({ pattern, score });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.map(m => m.pattern);
}

export function getScamPatternById(id: string): ScamPattern | undefined {
  return SCAM_KNOWLEDGE_BASE.find(p => p.id === id);
}

export function getAllScamPatterns(): ScamPattern[] {
  return SCAM_KNOWLEDGE_BASE;
}

// Compute a normalized similarity score (0-1) against all known scam patterns
export function computeRAGSimilarity(transcript: string): number {
  const text = transcript.toLowerCase();
  let totalKeywords = 0;
  let matchedKeywords = 0;

  for (const pattern of SCAM_KNOWLEDGE_BASE) {
    for (const keyword of pattern.keywords) {
      totalKeywords++;
      if (text.includes(keyword.toLowerCase())) {
        matchedKeywords++;
      }
    }
  }

  if (totalKeywords === 0) return 0;
  return Math.min(1, matchedKeywords / (totalKeywords * 0.15)); // Normalized so ~15% matches = 1.0
}
