// SentinelAI Mock Data Layer
// Structured for future Supabase/PostgreSQL migration

export interface CallRecord {
  id: string;
  phoneNumber: string;
  timestamp: string;
  duration: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  scamType: string;
  status: 'safe' | 'suspicious' | 'blocked';
  transcript?: string;
}

export interface ThreatAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface DashboardStats {
  totalCalls: number;
  threatsBlocked: number;
  protectionScore: number;
  activeThreats: number;
  callsAnalyzed: number;
  scamsDetected: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  eventType: 'call_detected' | 'score_increased' | 'alert_triggered' | 'report_generated' | 'ai_analysis' | 'system_reset';
  riskLevel: 'low' | 'medium' | 'high' | 'critical' | 'info';
  description: string;
  details?: string;
}

export interface GamificationData {
  safetyScore: number;
  protectionStreak: number;
  threatsBlocked: number;
  level: number;
  xp: number;
  xpToNext: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  total: number;
}

export interface ThreatMapMarker {
  id: string;
  lat: number;
  lng: number;
  city: string;
  threatCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  scamTypes: string[];
}

// ---- Mock Data ----

export const mockCallHistory: CallRecord[] = [
  { id: 'c1', phoneNumber: '+91 98765 43210', timestamp: '2024-12-15 14:32', duration: '2:45', riskScore: 92, riskLevel: 'critical', scamType: 'Bank OTP Scam', status: 'blocked', transcript: 'Sir, this is urgent. Your bank account has been compromised. Please share your OTP immediately to secure your account.' },
  { id: 'c2', phoneNumber: '+91 87654 32109', timestamp: '2024-12-15 11:18', duration: '1:30', riskScore: 75, riskLevel: 'high', scamType: 'UPI Scam', status: 'blocked', transcript: 'I am sending you a payment. Please accept the collect request on your UPI app.' },
  { id: 'c3', phoneNumber: '+91 55555 12345', timestamp: '2024-12-15 09:45', duration: '5:12', riskScore: 12, riskLevel: 'low', scamType: 'No Threat Detected', status: 'safe' },
  { id: 'c4', phoneNumber: '+91 76543 21098', timestamp: '2024-12-14 16:20', duration: '3:08', riskScore: 65, riskLevel: 'high', scamType: 'Loan Fraud', status: 'suspicious', transcript: 'You have been pre-approved for a personal loan. Just pay the processing fee to receive your funds.' },
  { id: 'c5', phoneNumber: '+91 65432 10987', timestamp: '2024-12-14 13:55', duration: '4:22', riskScore: 88, riskLevel: 'critical', scamType: 'Tech Support Scam', status: 'blocked', transcript: 'Your computer has been infected with a virus. Install AnyDesk so our team can fix it immediately.' },
  { id: 'c6', phoneNumber: '+91 11111 22222', timestamp: '2024-12-14 10:30', duration: '1:15', riskScore: 8, riskLevel: 'low', scamType: 'No Threat Detected', status: 'safe' },
  { id: 'c7', phoneNumber: '+91 54321 09876', timestamp: '2024-12-13 15:40', duration: '2:55', riskScore: 45, riskLevel: 'medium', scamType: 'Prize Scam', status: 'suspicious', transcript: 'Congratulations! You have won a cashback reward of Rs 50,000. Verify your identity to claim.' },
  { id: 'c8', phoneNumber: '+91 43210 98765', timestamp: '2024-12-13 09:10', duration: '6:30', riskScore: 5, riskLevel: 'low', scamType: 'No Threat Detected', status: 'safe' },
];

export const mockThreatAlerts: ThreatAlert[] = [
  { id: 'a1', type: 'Scam Call Blocked', severity: 'critical', message: 'Bank OTP scam attempt blocked from +91 98765 43210', timestamp: '2024-12-15 14:32', resolved: false },
  { id: 'a2', type: 'Suspicious Activity', severity: 'high', message: 'Multiple scam calls detected from same region', timestamp: '2024-12-15 12:00', resolved: false },
  { id: 'a3', type: 'Number Reported', severity: 'medium', message: '+91 87654 32109 reported by 28 users', timestamp: '2024-12-15 11:20', resolved: true },
  { id: 'a4', type: 'Threat Intelligence', severity: 'high', message: 'New tech support scam campaign detected in your area', timestamp: '2024-12-14 16:45', resolved: false },
  { id: 'a5', type: 'System Alert', severity: 'low', message: 'Protection database updated with 150 new scam patterns', timestamp: '2024-12-14 08:00', resolved: true },
];

export const mockDashboardStats: DashboardStats = {
  totalCalls: 1247,
  threatsBlocked: 89,
  protectionScore: 94,
  activeThreats: 3,
  callsAnalyzed: 856,
  scamsDetected: 127,
};

export const mockTimelineEvents: TimelineEvent[] = [
  { id: 't1', timestamp: '14:32:15', eventType: 'call_detected', riskLevel: 'critical', description: 'Suspicious call detected from +91 98765 43210', details: 'Incoming call flagged by pattern recognition' },
  { id: 't2', timestamp: '14:32:28', eventType: 'score_increased', riskLevel: 'high', description: 'Fraud score reached 92%', details: 'OTP request detected, urgency language identified' },
  { id: 't3', timestamp: '14:32:35', eventType: 'ai_analysis', riskLevel: 'critical', description: 'AI classified as Bank OTP Scam', details: 'Groq AI engine identified scam pattern with 92% confidence' },
  { id: 't4', timestamp: '14:32:40', eventType: 'alert_triggered', riskLevel: 'critical', description: 'Hardware alert activated — buzzer triggered', details: 'ESP32 buzzer and LED warning activated' },
  { id: 't5', timestamp: '14:33:02', eventType: 'report_generated', riskLevel: 'info', description: 'Cybercrime report auto-generated', details: 'Report ID: SR-2024-1215-001' },
  { id: 't6', timestamp: '11:18:22', eventType: 'call_detected', riskLevel: 'high', description: 'Suspicious call from +91 87654 32109', details: 'UPI payment request detected' },
  { id: 't7', timestamp: '11:18:45', eventType: 'score_increased', riskLevel: 'high', description: 'Fraud score reached 75%', details: 'Payment method and urgency detected' },
  { id: 't8', timestamp: '11:19:10', eventType: 'alert_triggered', riskLevel: 'high', description: 'LED warning activated', details: 'Medium-high threat level' },
  { id: 't9', timestamp: '09:45:00', eventType: 'call_detected', riskLevel: 'low', description: 'Call analyzed — no threat detected', details: 'Regular call from known contact' },
  { id: 't10', timestamp: '08:00:00', eventType: 'system_reset', riskLevel: 'info', description: 'Daily threat database sync completed', details: '150 new patterns added' },
];

export const mockGamificationData: GamificationData = {
  safetyScore: 94,
  protectionStreak: 15,
  threatsBlocked: 89,
  level: 7,
  xp: 2450,
  xpToNext: 3000,
  achievements: [
    { id: 'ach1', title: 'First Scam Detected', description: 'Detected your first scam call', icon: '🛡️', unlocked: true, unlockedAt: '2024-11-01', progress: 1, total: 1 },
    { id: 'ach2', title: '10 Threats Blocked', description: 'Successfully blocked 10 scam attempts', icon: '⚔️', unlocked: true, unlockedAt: '2024-11-15', progress: 10, total: 10 },
    { id: 'ach3', title: 'Cyber Guardian', description: 'Maintained 30-day protection streak', icon: '🏆', unlocked: false, progress: 15, total: 30 },
    { id: 'ach4', title: 'Community Protector', description: 'Reported 5 scam numbers to community', icon: '🌐', unlocked: true, unlockedAt: '2024-12-01', progress: 5, total: 5 },
    { id: 'ach5', title: 'AI Analyst', description: 'Used AI analysis on 50 calls', icon: '🤖', unlocked: false, progress: 32, total: 50 },
    { id: 'ach6', title: 'Perfect Score', description: 'Achieve 100% protection score', icon: '💎', unlocked: false, progress: 94, total: 100 },
    { id: 'ach7', title: 'Threat Hunter', description: 'Block 100 scam calls', icon: '🎯', unlocked: false, progress: 89, total: 100 },
    { id: 'ach8', title: 'Knowledge Seeker', description: 'Read all scam pattern guides', icon: '📚', unlocked: true, unlockedAt: '2024-12-10', progress: 6, total: 6 },
  ],
};

export const mockThreatMapMarkers: ThreatMapMarker[] = [
  { id: 'm1', lat: 28.6139, lng: 77.2090, city: 'New Delhi', threatCount: 234, riskLevel: 'critical', scamTypes: ['Bank OTP', 'KYC Scam'] },
  { id: 'm2', lat: 19.0760, lng: 72.8777, city: 'Mumbai', threatCount: 189, riskLevel: 'high', scamTypes: ['UPI Scam', 'Loan Fraud'] },
  { id: 'm3', lat: 13.0827, lng: 80.2707, city: 'Chennai', threatCount: 145, riskLevel: 'high', scamTypes: ['Tech Support', 'Phishing'] },
  { id: 'm4', lat: 12.9716, lng: 77.5946, city: 'Bangalore', threatCount: 167, riskLevel: 'high', scamTypes: ['Prize Scam', 'Identity Theft'] },
  { id: 'm5', lat: 22.5726, lng: 88.3639, city: 'Kolkata', threatCount: 98, riskLevel: 'medium', scamTypes: ['Loan Fraud'] },
  { id: 'm6', lat: 17.3850, lng: 78.4867, city: 'Hyderabad', threatCount: 156, riskLevel: 'high', scamTypes: ['Bank OTP', 'UPI Scam'] },
  { id: 'm7', lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', threatCount: 87, riskLevel: 'medium', scamTypes: ['KYC Scam'] },
  { id: 'm8', lat: 26.9124, lng: 75.7873, city: 'Jaipur', threatCount: 65, riskLevel: 'medium', scamTypes: ['Prize Scam', 'Loan Fraud'] },
  { id: 'm9', lat: 26.8467, lng: 80.9462, city: 'Lucknow', threatCount: 112, riskLevel: 'high', scamTypes: ['Bank OTP'] },
  { id: 'm10', lat: 18.5204, lng: 73.8567, city: 'Pune', threatCount: 78, riskLevel: 'medium', scamTypes: ['Tech Support'] },
];

// Chart data for Recharts
export const mockThreatChartData = [
  { date: 'Mon', threats: 12, blocked: 11, analyzed: 45 },
  { date: 'Tue', threats: 8, blocked: 8, analyzed: 38 },
  { date: 'Wed', threats: 15, blocked: 14, analyzed: 52 },
  { date: 'Thu', threats: 6, blocked: 6, analyzed: 41 },
  { date: 'Fri', threats: 18, blocked: 17, analyzed: 55 },
  { date: 'Sat', threats: 22, blocked: 20, analyzed: 48 },
  { date: 'Sun', threats: 9, blocked: 9, analyzed: 35 },
];

export const mockScamCategoryData = [
  { name: 'Bank OTP', value: 35, fill: '#ef4444' },
  { name: 'UPI Scam', value: 22, fill: '#f59e0b' },
  { name: 'Tech Support', value: 18, fill: '#a855f7' },
  { name: 'KYC Fraud', value: 12, fill: '#22d3ee' },
  { name: 'Loan Scam', value: 8, fill: '#10b981' },
  { name: 'Phishing', value: 5, fill: '#6366f1' },
];

// Simulated demo transcript for judges
export const DEMO_TRANSCRIPT = "Hello sir, I am calling from your bank's security department. We have detected a suspicious transaction on your account. Your account will be blocked in the next 30 minutes. To prevent this, please share the OTP that you will receive on your registered mobile number immediately. This is very urgent, sir. Please hurry, your account is at risk.";
