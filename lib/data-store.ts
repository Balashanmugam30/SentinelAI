// SentinelAI Central Data Store
// In-memory store for calls, evidence, gamification, reputation, and threat history
// All pages read/write to this single source of truth

export interface RecordedCall {
  callId: string;
  timestamp: string;
  transcript: string;
  phoneNumber: string;
  duration: string;
  riskScore: number;
  riskLevel: string;
  scamType: string;
  context: string;
  confidence: number;
  reasoning: string;
  aiSource: string;
  status: 'analyzed' | 'blocked' | 'safe';
}

export interface EvidenceLog {
  evidenceId: string;
  callId: string;
  timestamp: string;
  transcript: string;
  riskScore: number;
  scamType: string;
  context: string;
  reasoning: string;
  phoneNumber: string;
  captured: boolean;
}

export interface GamificationState {
  xp: number;
  level: number;
  xpToNext: number;
  safetyScore: number;
  protectionStreak: number;
  threatsBlocked: number;
  reportsSubmitted: number;
  analysesPerformed: number;
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

export interface ReportedNumber {
  phoneNumber: string;
  reportCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  scamTypes: string[];
  lastReported: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  icon: string;
}

// --------------- INITIAL STATE ---------------

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-scan', title: 'First Scam Detected', description: 'Detected your first scam call', icon: '🛡️', unlocked: false, progress: 0, total: 1 },
  { id: 'ten-blocked', title: '10 Threats Blocked', description: 'Successfully blocked 10 scam attempts', icon: '⚔️', unlocked: false, progress: 0, total: 10 },
  { id: 'guardian', title: 'Cyber Guardian', description: 'Maintained 30-day protection streak', icon: '🏆', unlocked: false, progress: 0, total: 30 },
  { id: 'protector', title: 'Community Protector', description: 'Reported 5 scam numbers to community', icon: '🌐', unlocked: false, progress: 0, total: 5 },
  { id: 'analyst', title: 'Threat Analyst', description: 'Performed 20 AI analyses', icon: '🔬', unlocked: false, progress: 0, total: 20 },
  { id: 'hunter', title: 'Threat Hunter', description: 'Blocked 100 scam attempts', icon: '🎯', unlocked: false, progress: 0, total: 100 },
  { id: 'reporter', title: 'Vigilant Reporter', description: 'Submitted 10 cybercrime reports', icon: '📋', unlocked: false, progress: 0, total: 10 },
  { id: 'voice-master', title: 'Voice Master', description: 'Analyzed 50 voice transcripts', icon: '🎙️', unlocked: false, progress: 0, total: 50 },
];

class SentinelDataStore {
  private recordedCalls: RecordedCall[] = [];
  private evidenceLogs: EvidenceLog[] = [];
  private reportedNumbers: Map<string, ReportedNumber> = new Map();
  private timelineEvents: TimelineEvent[] = [];
  private gamification: GamificationState = {
    xp: 0,
    level: 1,
    xpToNext: 500,
    safetyScore: 50,
    protectionStreak: 1,
    threatsBlocked: 0,
    reportsSubmitted: 0,
    analysesPerformed: 0,
    achievements: [...DEFAULT_ACHIEVEMENTS],
  };
  private listeners: Set<() => void> = new Set();

  // --------------- SUBSCRIPTION ---------------
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --------------- CALLS ---------------
  recordCall(call: Omit<RecordedCall, 'callId'>): RecordedCall {
    const callId = `CALL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const recorded: RecordedCall = { callId, ...call };
    this.recordedCalls.unshift(recorded);

    // Auto-capture evidence if risk > 70
    if (recorded.riskScore >= 70) {
      this.captureEvidence(recorded);
    }

    // Timeline event
    this.addTimelineEvent({
      type: recorded.riskScore >= 70 ? 'threat' : 'call',
      title: recorded.riskScore >= 70
        ? `Threat detected — ${recorded.scamType}`
        : `Call analyzed — ${recorded.context}`,
      description: `Risk: ${recorded.riskScore}% | ${recorded.scamType}`,
      severity: recorded.riskScore >= 80 ? 'critical' : recorded.riskScore >= 60 ? 'high' : recorded.riskScore >= 35 ? 'medium' : 'info',
      icon: recorded.riskScore >= 70 ? '🚨' : '📞',
    });

    // Gamification
    this.addXP(2, 'AI analysis performed');
    this.gamification.analysesPerformed++;
    this.updateAchievement('analyst', this.gamification.analysesPerformed);
    this.updateAchievement('voice-master', this.gamification.analysesPerformed);

    if (recorded.riskScore >= 60) {
      this.addXP(10, 'Threat detected and blocked');
      this.gamification.threatsBlocked++;
      this.updateAchievement('first-scan', 1);
      this.updateAchievement('ten-blocked', this.gamification.threatsBlocked);
      this.updateAchievement('hunter', this.gamification.threatsBlocked);
    }

    this.recalcSafetyScore();
    this.notify();
    return recorded;
  }

  getRecordedCalls(): RecordedCall[] {
    return [...this.recordedCalls];
  }

  // --------------- EVIDENCE ---------------
  private captureEvidence(call: RecordedCall) {
    const evidence: EvidenceLog = {
      evidenceId: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      callId: call.callId,
      timestamp: call.timestamp,
      transcript: call.transcript,
      riskScore: call.riskScore,
      scamType: call.scamType,
      context: call.context,
      reasoning: call.reasoning,
      phoneNumber: call.phoneNumber,
      captured: true,
    };
    this.evidenceLogs.unshift(evidence);

    this.addTimelineEvent({
      type: 'evidence',
      title: 'Evidence captured automatically',
      description: `Risk ${call.riskScore}% — ${call.scamType} from ${call.phoneNumber || 'Unknown'}`,
      severity: 'critical',
      icon: '📸',
    });
  }

  getEvidenceLogs(): EvidenceLog[] {
    return [...this.evidenceLogs];
  }

  // --------------- REPORTS ---------------
  submitReport(phoneNumber: string, scamType: string) {
    // Update reputation
    const existing = this.reportedNumbers.get(phoneNumber);
    if (existing) {
      existing.reportCount++;
      if (!existing.scamTypes.includes(scamType)) existing.scamTypes.push(scamType);
      existing.lastReported = new Date().toISOString();
      existing.riskLevel = this.computeRepLevel(existing.reportCount);
    } else {
      this.reportedNumbers.set(phoneNumber, {
        phoneNumber,
        reportCount: 1,
        riskLevel: 'low',
        scamTypes: [scamType],
        lastReported: new Date().toISOString(),
      });
    }

    // Gamification
    this.addXP(15, 'Report submitted');
    this.gamification.reportsSubmitted++;
    this.updateAchievement('protector', this.gamification.reportsSubmitted);
    this.updateAchievement('reporter', this.gamification.reportsSubmitted);

    this.addTimelineEvent({
      type: 'report',
      title: 'Cybercrime report submitted',
      description: `${phoneNumber} reported as ${scamType}`,
      severity: 'high',
      icon: '📋',
    });

    this.notify();
  }

  private computeRepLevel(count: number): 'low' | 'medium' | 'high' | 'critical' {
    if (count >= 20) return 'critical';
    if (count >= 10) return 'high';
    if (count >= 5) return 'medium';
    return 'low';
  }

  getReportedNumbers(): ReportedNumber[] {
    return Array.from(this.reportedNumbers.values());
  }

  // --------------- TIMELINE ---------------
  addTimelineEvent(event: Omit<TimelineEvent, 'id' | 'timestamp'>) {
    this.timelineEvents.unshift({
      id: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      ...event,
    });
    // Keep max 50 events
    if (this.timelineEvents.length > 50) this.timelineEvents = this.timelineEvents.slice(0, 50);
  }

  getTimelineEvents(): TimelineEvent[] {
    return [...this.timelineEvents];
  }

  // --------------- GAMIFICATION ---------------
  private addXP(amount: number, _reason: string) {
    this.gamification.xp += amount;
    // Level up
    while (this.gamification.xp >= this.gamification.xpToNext) {
      this.gamification.xp -= this.gamification.xpToNext;
      this.gamification.level++;
      this.gamification.xpToNext = Math.round(this.gamification.xpToNext * 1.5);
    }
  }

  private updateAchievement(id: string, progress: number) {
    const ach = this.gamification.achievements.find(a => a.id === id);
    if (!ach) return;
    ach.progress = Math.min(progress, ach.total);
    if (ach.progress >= ach.total && !ach.unlocked) {
      ach.unlocked = true;
      ach.unlockedAt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      this.addXP(50, `Achievement unlocked: ${ach.title}`);
      this.addTimelineEvent({
        type: 'achievement',
        title: `Achievement unlocked: ${ach.title}`,
        description: ach.description,
        severity: 'info',
        icon: ach.icon,
      });
    }
  }

  private recalcSafetyScore() {
    const total = this.recordedCalls.length;
    if (total === 0) { this.gamification.safetyScore = 50; return; }
    const safe = this.recordedCalls.filter(c => c.riskScore < 50).length;
    this.gamification.safetyScore = Math.round((safe / total) * 100);
  }

  getGamification(): GamificationState {
    return { ...this.gamification, achievements: this.gamification.achievements.map(a => ({ ...a })) };
  }

  // --------------- STATS ---------------
  getDashboardStats() {
    return {
      callsAnalyzed: this.recordedCalls.length,
      threatsBlocked: this.gamification.threatsBlocked,
      protectionScore: this.gamification.safetyScore,
      activeThreats: this.recordedCalls.filter(c => c.riskScore >= 70 && c.status !== 'safe').length,
      reportsSubmitted: this.gamification.reportsSubmitted,
    };
  }
}

// Singleton instance
const store = new SentinelDataStore();
export default store;
