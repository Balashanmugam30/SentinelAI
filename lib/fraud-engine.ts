// SentinelAI Fraud Detection Engine
// Rule-based scoring system for real-time scam detection

export interface FraudResult {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  triggers: FraudTrigger[];
  scamType: string;
}

export interface FraudTrigger {
  keyword: string;
  category: string;
  points: number;
  description: string;
}

const FRAUD_RULES: { pattern: RegExp; category: string; points: number; description: string }[] = [
  // OTP & Verification
  { pattern: /\b(otp|one.?time.?password|verification.?code|security.?code)\b/i, category: 'OTP Request', points: 40, description: 'Request for OTP/verification code detected' },
  { pattern: /\b(send.?otp|share.?otp|tell.?otp|give.?otp)\b/i, category: 'OTP Sharing', points: 45, description: 'Direct request to share sensitive codes' },

  // Bank Scams
  { pattern: /\b(bank.?account|account.?blocked|account.?suspended|account.?freeze|account.?locked)\b/i, category: 'Bank Threat', points: 30, description: 'Threat concerning bank account status' },
  { pattern: /\b(kyc.?verification|update.?kyc|bank.?verification)\b/i, category: 'KYC Scam', points: 30, description: 'Fake KYC verification attempt' },

  // UPI / Payment Scams
  { pattern: /\b(upi|gpay|google.?pay|phonepe|paytm)\b/i, category: 'Payment Method', points: 25, description: 'UPI or mobile payment method mentioned' },
  { pattern: /\b(payment.?request|collect.?request|approve.?payment)\b/i, category: 'Payment Request', points: 30, description: 'Direct request for payment or approval' },

  // Delivery Scams
  { pattern: /\b(delivery.?otp|amazon.?delivery|courier.?otp|parcel.?verification|package.?delivery.?code)\b/i, category: 'Delivery Scam', points: 35, description: 'Fake delivery verification code scheme' },

  // Credit Card Fraud
  { pattern: /\b\d{16}\b/i, category: 'Credit Card Exposure', points: 60, description: 'Possible credit card information exposure detected.' },
  { pattern: /\b(card.?number|credit.?card.?number|debit.?card.?number|16.?digit.?card.?number)\b/i, category: 'Credit Card Request', points: 40, description: 'Request for full card number' },
  { pattern: /\b(card.?expiry|cvv|atm.?pin)\b/i, category: 'Card Security Detail', points: 45, description: 'Request for CVV, expiry, or PIN' },

  // Urgency Manipulation
  { pattern: /\b(urgent|immediately|right.?now|within.?10.?minutes|account.?will.?be.?blocked|last.?warning)\b/i, category: 'Urgency', points: 20, description: 'Urgent or threatening language to pressure victim' },

  // Authority Impersonation
  { pattern: /\b(bank.?officer|police.?officer|cybercrime.?officer|income.?tax.?department|rbi.?officer|customer.?care)\b/i, category: 'Impersonation', points: 25, description: 'Authority impersonation detected' },

  // Lottery / Reward Scams
  { pattern: /\b(lottery|you.?won|congratulations.?winner|claim.?reward|prize.?money)\b/i, category: 'Prize Scam', points: 30, description: 'Fake prize or reward offer' },

  // Tech Support Scams
  { pattern: /\b(your.?device.?is.?hacked|virus.?detected|system.?infected|install.?remote.?software|anydesk|teamviewer)\b/i, category: 'Tech Support Scam', points: 35, description: 'Remote access or malware warning' },

  // Personal Data Theft
  { pattern: /\b(aadhaar|pan.?number|bank.?details|ifsc|account.?number|date.?of.?birth)\b/i, category: 'Identity Request', points: 35, description: 'Request for PII or sensitive banking details' },

  // MULTILINGUAL KEYWORDS - TAMIL
  { pattern: /\b(வங்கி|கணக்கு|அட்டை.?எண்|அடையாள.?அட்டை)\b/i, category: 'Bank Threat', points: 30, description: 'Tamil: Bank/Account references' },
  { pattern: /\b(கடவுச்சொல்|otp|kyc)\b/i, category: 'OTP Request', points: 40, description: 'Tamil: Password/OTP/KYC request' },
  { pattern: /\b(பணம்)\b/i, category: 'Payment Request', points: 30, description: 'Tamil: Money request' },
  { pattern: /\b(உடனே|அவசரம்)\b/i, category: 'Urgency', points: 20, description: 'Tamil: Urgency/Emergency' },
  { pattern: /\b(வெற்றி|லாட்டரி|பரிசு)\b/i, category: 'Prize Scam', points: 30, description: 'Tamil: Lottery/Prize' },

  // MULTILINGUAL KEYWORDS - HINDI
  { pattern: /\b(बैंक|खाता|क्रेडिट.?कार्ड)\b/i, category: 'Bank Threat', points: 30, description: 'Hindi: Bank/Account references' },
  { pattern: /\b(पासवर्ड|ओटीपी|otp)\b/i, category: 'OTP Request', points: 40, description: 'Hindi: Password/OTP request' },
  { pattern: /\b(पैसे.?भेजो)\b/i, category: 'Payment Request', points: 30, description: 'Hindi: Send money' },
  { pattern: /\b(जल्दी|तुरंत)\b/i, category: 'Urgency', points: 20, description: 'Hindi: Urgency/Immediately' },
  { pattern: /\b(लॉटरी|इनाम)\b/i, category: 'Prize Scam', points: 30, description: 'Hindi: Lottery/Prize' },

  // MULTILINGUAL KEYWORDS - TELUGU
  { pattern: /\b(బ్యాంక్|ఖాతా)\b/i, category: 'Bank Threat', points: 30, description: 'Telugu: Bank/Account references' },
  { pattern: /\b(పాస్వర్డ్|otp)\b/i, category: 'OTP Request', points: 40, description: 'Telugu: Password/OTP request' },
  { pattern: /\b(డబ్బు.?పంపండి)\b/i, category: 'Payment Request', points: 30, description: 'Telugu: Send money' },
  { pattern: /\b(అత్యవసరం)\b/i, category: 'Urgency', points: 20, description: 'Telugu: Urgency' },
  { pattern: /\b(లాటరీ|బహుమతి)\b/i, category: 'Prize Scam', points: 30, description: 'Telugu: Lottery/Prize' },

  // MULTILINGUAL KEYWORDS - MALAYALAM
  { pattern: /\b(ബാങ്ക്|അക്കൗണ്ട്)\b/i, category: 'Bank Threat', points: 30, description: 'Malayalam: Bank/Account references' },
  { pattern: /\b(പാസ്വേഡ്|otp)\b/i, category: 'OTP Request', points: 40, description: 'Malayalam: Password/OTP request' },
  { pattern: /\b(പണം.?അയയ്ക്കുക)\b/i, category: 'Payment Request', points: 30, description: 'Malayalam: Send money' },
  { pattern: /\b(അടിയന്തരമായി)\b/i, category: 'Urgency', points: 20, description: 'Malayalam: Urgency' },

  // MULTILINGUAL KEYWORDS - KANNADA
  { pattern: /\b(ಬ್ಯಾಂಕ್|ಖಾತೆ)\b/i, category: 'Bank Threat', points: 30, description: 'Kannada: Bank/Account references' },
  { pattern: /\b(ಪಾಸ್ವರ್ಡ್|otp)\b/i, category: 'OTP Request', points: 40, description: 'Kannada: Password/OTP request' },
  { pattern: /\b(ಹಣ.?ಕಳುಹಿಸಿ)\b/i, category: 'Payment Request', points: 30, description: 'Kannada: Send money' },
  { pattern: /\b(ತುರ್ತು)\b/i, category: 'Urgency', points: 20, description: 'Kannada: Urgency' },
];

export function analyzeFraud(transcript: string): FraudResult {
  const triggers: FraudTrigger[] = [];
  let totalScore = 0;

  for (const rule of FRAUD_RULES) {
    const match = transcript.match(rule.pattern);
    if (match) {
      triggers.push({
        keyword: match[0],
        category: rule.category,
        points: rule.points,
        description: rule.description,
      });
      totalScore += rule.points;
    }
  }

  // Cap at 100
  const score = Math.min(totalScore, 100);

  const riskLevel: FraudResult['riskLevel'] =
    score >= 80 ? 'critical' :
    score >= 60 ? 'high' :
    score >= 30 ? 'medium' : 'low';

  const scamType = detectScamType(triggers);

  return { score, riskLevel, triggers, scamType };
}

function detectScamType(triggers: FraudTrigger[]): string {
  const categories = triggers.map(t => t.category);
  if (categories.includes('OTP Request') || categories.includes('OTP Sharing')) return 'Bank OTP Scam';
  if (categories.includes('KYC Scam') || categories.includes('Bank Threat')) return 'Bank Scam';
  if (categories.includes('Delivery Scam')) return 'Delivery Scam';
  if (categories.includes('Credit Card Exposure') || categories.includes('Credit Card Request') || categories.includes('Card Security Detail')) return 'Credit Card Scam';
  if (categories.includes('Payment Request') || categories.includes('Payment Method')) return 'UPI Payment Scam';
  if (categories.includes('Tech Support Scam')) return 'Tech Support Scam';
  if (categories.includes('Prize Scam')) return 'Lottery Scam';
  if (categories.includes('Impersonation')) return 'Authority Impersonation';
  if (categories.includes('Identity Request')) return 'Identity Theft';
  if (triggers.length > 0) return 'Suspicious Activity';
  return 'No Threat Detected';
}

export function getRiskColor(level: FraudResult['riskLevel']): string {
  switch (level) {
    case 'low': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'high': return '#f97316';
    case 'critical': return '#ef4444';
  }
}

export function getRiskLabel(score: number): string {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}
