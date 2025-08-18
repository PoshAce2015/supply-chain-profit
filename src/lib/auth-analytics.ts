// Authentication Analytics and Monitoring System

export interface AuthEvent {
  id: string;
  timestamp: number;
  type: 'login' | 'logout' | 'register' | 'password_reset' | 'failed_login' | 'account_locked' | 'security_alert';
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  metadata: Record<string, any>;
  sessionId?: string;
}

export interface SecurityIncident {
  id: string;
  timestamp: number;
  type: 'brute_force' | 'suspicious_activity' | 'account_compromise' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUser?: string;
  metadata: Record<string, any>;
  resolved: boolean;
  resolvedAt?: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class AuthAnalytics {
  private events: AuthEvent[] = [];
  private incidents: SecurityIncident[] = [];
  private metrics: PerformanceMetric[] = [];
  private maxEvents = 1000;
  private maxIncidents = 100;
  private maxMetrics = 500;

  constructor() {
    this.loadFromStorage();
    this.setupPeriodicCleanup();
  }

  // Event tracking
  trackEvent(event: Omit<AuthEvent, 'id' | 'timestamp'>): void {
    const fullEvent: AuthEvent = {
      ...event,
      id: this.generateId(),
      timestamp: Date.now()
    };

    this.events.unshift(fullEvent);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    this.saveToStorage();
    this.analyzeEvent(fullEvent);
  }

  // Security incident tracking
  trackIncident(incident: Omit<SecurityIncident, 'id' | 'timestamp'>): void {
    const fullIncident: SecurityIncident = {
      ...incident,
      id: this.generateId(),
      timestamp: Date.now()
    };

    this.incidents.unshift(fullIncident);
    
    if (this.incidents.length > this.maxIncidents) {
      this.incidents = this.incidents.slice(0, this.maxIncidents);
    }

    this.saveToStorage();
    this.notifySecurityTeam(fullIncident);
  }

  // Performance metric tracking
  trackMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.metrics.unshift(fullMetric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(0, this.maxMetrics);
    }

    this.saveToStorage();
  }

  // Analytics queries
  getEvents(filters?: {
    type?: string;
    userId?: string;
    email?: string;
    startTime?: number;
    endTime?: number;
    success?: boolean;
  }): AuthEvent[] {
    let filtered = this.events;

    if (filters?.type) {
      filtered = filtered.filter(e => e.type === filters.type);
    }
    if (filters?.userId) {
      filtered = filtered.filter(e => e.userId === filters.userId);
    }
    if (filters?.email) {
      filtered = filtered.filter(e => e.email === filters.email);
    }
    if (filters?.startTime) {
      filtered = filtered.filter(e => e.timestamp >= filters.startTime!);
    }
    if (filters?.endTime) {
      filtered = filtered.filter(e => e.timestamp <= filters.endTime!);
    }
    if (filters?.success !== undefined) {
      filtered = filtered.filter(e => e.success === filters.success);
    }

    return filtered;
  }

  getIncidents(filters?: {
    type?: string;
    severity?: string;
    resolved?: boolean;
    startTime?: number;
    endTime?: number;
  }): SecurityIncident[] {
    let filtered = this.incidents;

    if (filters?.type) {
      filtered = filtered.filter(i => i.type === filters.type);
    }
    if (filters?.severity) {
      filtered = filtered.filter(i => i.severity === filters.severity);
    }
    if (filters?.resolved !== undefined) {
      filtered = filtered.filter(i => i.resolved === filters.resolved);
    }
    if (filters?.startTime) {
      filtered = filtered.filter(i => i.timestamp >= filters.startTime!);
    }
    if (filters?.endTime) {
      filtered = filtered.filter(i => i.timestamp <= filters.endTime!);
    }

    return filtered;
  }

  getMetrics(filters?: {
    name?: string;
    startTime?: number;
    endTime?: number;
  }): PerformanceMetric[] {
    let filtered = this.metrics;

    if (filters?.name) {
      filtered = filtered.filter(m => m.name === filters.name);
    }
    if (filters?.startTime) {
      filtered = filtered.filter(m => m.timestamp >= filters.startTime!);
    }
    if (filters?.endTime) {
      filtered = filtered.filter(m => m.timestamp <= filters.endTime!);
    }

    return filtered;
  }

  // Analytics calculations
  getLoginSuccessRate(timeWindow: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - timeWindow;
    const loginEvents = this.events.filter(e => 
      e.type === 'login' && e.timestamp >= cutoff
    );

    if (loginEvents.length === 0) return 0;

    const successfulLogins = loginEvents.filter(e => e.success).length;
    return (successfulLogins / loginEvents.length) * 100;
  }

  getFailedLoginAttempts(timeWindow: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - timeWindow;
    return this.events.filter(e => 
      e.type === 'failed_login' && e.timestamp >= cutoff
    ).length;
  }

  getActiveUsers(timeWindow: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - timeWindow;
    const recentLogins = this.events.filter(e => 
      e.type === 'login' && e.success && e.timestamp >= cutoff
    );
    
    const uniqueUsers = new Set(recentLogins.map(e => e.userId || e.email));
    return uniqueUsers.size;
  }

  getSecurityIncidentCount(timeWindow: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - timeWindow;
    return this.incidents.filter(i => i.timestamp >= cutoff).length;
  }

  getAverageLoginTime(): number {
    const loginEvents = this.events.filter(e => e.type === 'login' && e.success);
    if (loginEvents.length === 0) return 0;

    const totalTime = loginEvents.reduce((sum, e) => {
      return sum + (e.metadata.loginTime || 0);
    }, 0);

    return totalTime / loginEvents.length;
  }

  // Dashboard data
  getDashboardData() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const last7d = now - (7 * 24 * 60 * 60 * 1000);

    return {
      loginSuccessRate: this.getLoginSuccessRate(),
      failedLoginAttempts: this.getFailedLoginAttempts(),
      activeUsers: this.getActiveUsers(),
      securityIncidents: this.getSecurityIncidentCount(),
      averageLoginTime: this.getAverageLoginTime(),
      recentEvents: this.getEvents({ startTime: last24h }).slice(0, 10),
      recentIncidents: this.getIncidents({ startTime: last24h, resolved: false }).slice(0, 5),
      loginTrend: this.getLoginTrend(last7d),
      securityTrend: this.getSecurityTrend(last7d)
    };
  }

  private getLoginTrend(timeWindow: number) {
    const cutoff = Date.now() - timeWindow;
    const loginEvents = this.events.filter(e => 
      e.type === 'login' && e.timestamp >= cutoff
    );

    // Group by hour
    const hourlyData: Record<number, { success: number; failed: number }> = {};
    
    loginEvents.forEach(event => {
      const hour = Math.floor(event.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);
      if (!hourlyData[hour]) {
        hourlyData[hour] = { success: 0, failed: 0 };
      }
      
      if (event.success) {
        hourlyData[hour].success++;
      } else {
        hourlyData[hour].failed++;
      }
    });

    return Object.entries(hourlyData).map(([timestamp, data]) => ({
      timestamp: parseInt(timestamp),
      success: data.success,
      failed: data.failed
    }));
  }

  private getSecurityTrend(timeWindow: number) {
    const cutoff = Date.now() - timeWindow;
    const incidents = this.incidents.filter(i => i.timestamp >= cutoff);

    // Group by day
    const dailyData: Record<number, number> = {};
    
    incidents.forEach(incident => {
      const day = Math.floor(incident.timestamp / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
      dailyData[day] = (dailyData[day] || 0) + 1;
    });

    return Object.entries(dailyData).map(([timestamp, count]) => ({
      timestamp: parseInt(timestamp),
      count
    }));
  }

  // Event analysis
  private analyzeEvent(event: AuthEvent): void {
    // Detect brute force attacks
    if (event.type === 'failed_login') {
      this.detectBruteForce(event);
    }

    // Detect suspicious activity
    if (event.type === 'login' && event.success) {
      this.detectSuspiciousActivity(event);
    }

    // Track performance metrics
    if (event.metadata.loginTime) {
      this.trackMetric({
        name: 'login_time',
        value: event.metadata.loginTime,
        unit: 'ms',
        metadata: { eventType: event.type }
      });
    }
  }

  private detectBruteForce(event: AuthEvent): void {
    const timeWindow = 15 * 60 * 1000; // 15 minutes
    const cutoff = Date.now() - timeWindow;
    
    const recentFailures = this.events.filter(e => 
      e.type === 'failed_login' && 
      e.email === event.email && 
      e.timestamp >= cutoff
    );

    if (recentFailures.length >= 5) {
      this.trackIncident({
        type: 'brute_force',
        severity: 'high',
        description: `Multiple failed login attempts detected for ${event.email}`,
        affectedUser: event.email,
        metadata: {
          failureCount: recentFailures.length,
          timeWindow: timeWindow,
          lastFailure: event.timestamp
        },
        resolved: false
      });
    }
  }

  private detectSuspiciousActivity(event: AuthEvent): void {
    // Check for login from new location/device
    const userLogins = this.events.filter(e => 
      e.type === 'login' && 
      e.success && 
      e.email === event.email
    );

    if (userLogins.length > 1) {
      const previousLogin = userLogins[1]; // Most recent after current
      
      if (event.metadata.ipAddress && 
          previousLogin.metadata.ipAddress && 
          event.metadata.ipAddress !== previousLogin.metadata.ipAddress) {
        
        this.trackIncident({
          type: 'suspicious_activity',
          severity: 'medium',
          description: `Login from new IP address for ${event.email}`,
          affectedUser: event.email,
          metadata: {
            newIp: event.metadata.ipAddress,
            previousIp: previousLogin.metadata.ipAddress,
            timeSinceLastLogin: event.timestamp - previousLogin.timestamp
          },
          resolved: false
        });
      }
    }
  }

  private notifySecurityTeam(incident: SecurityIncident): void {
    // In a real app, this would send notifications
    console.warn('Security Incident:', incident);
    
    if (incident.severity === 'critical') {
      // Immediate notification
      console.error('CRITICAL SECURITY INCIDENT:', incident);
    }
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('auth_analytics_events', JSON.stringify(this.events));
      localStorage.setItem('auth_analytics_incidents', JSON.stringify(this.incidents));
      localStorage.setItem('auth_analytics_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.warn('Failed to save analytics data:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const events = localStorage.getItem('auth_analytics_events');
      const incidents = localStorage.getItem('auth_analytics_incidents');
      const metrics = localStorage.getItem('auth_analytics_metrics');

      if (events) this.events = JSON.parse(events);
      if (incidents) this.incidents = JSON.parse(incidents);
      if (metrics) this.metrics = JSON.parse(metrics);
    } catch (error) {
      console.warn('Failed to load analytics data:', error);
    }
  }

  private setupPeriodicCleanup(): void {
    // Clean up old data every hour
    setInterval(() => {
      const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
      
      this.events = this.events.filter(e => e.timestamp >= cutoff);
      this.incidents = this.incidents.filter(i => i.timestamp >= cutoff);
      this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
      
      this.saveToStorage();
    }, 60 * 60 * 1000);
  }

  // Public API
  resolveIncident(incidentId: string): void {
    const incident = this.incidents.find(i => i.id === incidentId);
    if (incident) {
      incident.resolved = true;
      incident.resolvedAt = Date.now();
      this.saveToStorage();
    }
  }

  clearData(): void {
    this.events = [];
    this.incidents = [];
    this.metrics = [];
    this.saveToStorage();
  }

  exportData(): {
    events: AuthEvent[];
    incidents: SecurityIncident[];
    metrics: PerformanceMetric[];
  } {
    return {
      events: [...this.events],
      incidents: [...this.incidents],
      metrics: [...this.metrics]
    };
  }
}

// Global analytics instance
export const authAnalytics = new AuthAnalytics();

// Convenience functions
export const trackLogin = (data: {
  userId?: string;
  email: string;
  success: boolean;
  loginTime?: number;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}) => {
  authAnalytics.trackEvent({
    type: 'login',
    success: data.success,
    userId: data.userId,
    email: data.email,
    metadata: {
      loginTime: data.loginTime,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    },
    sessionId: data.sessionId
  });
};

export const trackLogout = (data: {
  userId?: string;
  email: string;
  sessionId?: string;
}) => {
  authAnalytics.trackEvent({
    type: 'logout',
    success: true,
    userId: data.userId,
    email: data.email,
    metadata: {},
    sessionId: data.sessionId
  });
};

export const trackFailedLogin = (data: {
  email: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  authAnalytics.trackEvent({
    type: 'failed_login',
    success: false,
    email: data.email,
    metadata: {
      reason: data.reason,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    }
  });
};

export const trackRegistration = (data: {
  userId: string;
  email: string;
  registrationTime?: number;
}) => {
  authAnalytics.trackEvent({
    type: 'register',
    success: true,
    userId: data.userId,
    email: data.email,
    metadata: {
      registrationTime: data.registrationTime
    }
  });
};

export const trackPasswordReset = (data: {
  email: string;
  success: boolean;
  resetMethod: 'email' | 'token';
}) => {
  authAnalytics.trackEvent({
    type: 'password_reset',
    success: data.success,
    email: data.email,
    metadata: {
      resetMethod: data.resetMethod
    }
  });
};
