import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { authAnalytics, trackLogin, trackLogout, trackFailedLogin, trackRegistration, trackPasswordReset } from '../auth-analytics';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('Auth Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Clear analytics data
    authAnalytics.clearData();
  });

  describe('Event Tracking', () => {
    it('tracks login events correctly', () => {
      const eventData = {
        userId: 'user123',
        email: 'test@example.com',
        success: true,
        loginTime: 1500,
        ipAddress: '192.168.1.1',
        userAgent: 'test-agent',
        sessionId: 'session123'
      };

      trackLogin(eventData);

      const events = authAnalytics.getEvents({ type: 'login' });
      expect(events).toHaveLength(1);
      
      const event = events[0];
      expect(event?.type).toBe('login');
      expect(event?.success).toBe(true);
      expect(event?.userId).toBe('user123');
      expect(event?.email).toBe('test@example.com');
      expect(event?.metadata.loginTime).toBe(1500);
      expect(event?.metadata.ipAddress).toBe('192.168.1.1');
      expect(event?.metadata.userAgent).toBe('test-agent');
      expect(event?.sessionId).toBe('session123');
    });

    it('tracks failed login events', () => {
      const eventData = {
        email: 'test@example.com',
        reason: 'Invalid credentials',
        ipAddress: '192.168.1.1',
        userAgent: 'test-agent'
      };

      trackFailedLogin(eventData);

      const events = authAnalytics.getEvents({ type: 'failed_login' });
      expect(events).toHaveLength(1);
      
      const event = events[0];
      expect(event?.type).toBe('failed_login');
      expect(event?.success).toBe(false);
      expect(event?.email).toBe('test@example.com');
      expect(event?.metadata.reason).toBe('Invalid credentials');
    });

    it('tracks logout events', () => {
      const eventData = {
        userId: 'user123',
        email: 'test@example.com',
        sessionId: 'session123'
      };

      trackLogout(eventData);

      const events = authAnalytics.getEvents({ type: 'logout' });
      expect(events).toHaveLength(1);
      
      const event = events[0];
      expect(event?.type).toBe('logout');
      expect(event?.success).toBe(true);
      expect(event?.userId).toBe('user123');
      expect(event?.email).toBe('test@example.com');
    });

    it('tracks registration events', () => {
      const eventData = {
        userId: 'user123',
        email: 'test@example.com',
        registrationTime: 2000
      };

      trackRegistration(eventData);

      const events = authAnalytics.getEvents({ type: 'register' });
      expect(events).toHaveLength(1);
      
      const event = events[0];
      expect(event?.type).toBe('register');
      expect(event?.success).toBe(true);
      expect(event?.userId).toBe('user123');
      expect(event?.email).toBe('test@example.com');
      expect(event?.metadata.registrationTime).toBe(2000);
    });

    it('tracks password reset events', () => {
      const eventData = {
        email: 'test@example.com',
        success: true,
        resetMethod: 'email' as const
      };

      trackPasswordReset(eventData);

      const events = authAnalytics.getEvents({ type: 'password_reset' });
      expect(events).toHaveLength(1);
      
      const event = events[0];
      expect(event?.type).toBe('password_reset');
      expect(event?.success).toBe(true);
      expect(event?.email).toBe('test@example.com');
      expect(event?.metadata.resetMethod).toBe('email');
    });
  });

  describe('Security Incident Tracking', () => {
    it('tracks brute force incidents', () => {
      const incidentData = {
        type: 'brute_force' as const,
        severity: 'high' as const,
        description: 'Multiple failed login attempts detected',
        affectedUser: 'test@example.com',
        resolved: false,
        metadata: {
          failureCount: 10,
          timeWindow: 900000
        }
      };

      authAnalytics.trackIncident(incidentData);

      const incidents = authAnalytics.getIncidents({ type: 'brute_force' });
      expect(incidents).toHaveLength(1);
      
      const incident = incidents[0];
      expect(incident?.type).toBe('brute_force');
      expect(incident?.severity).toBe('high');
      expect(incident?.description).toBe('Multiple failed login attempts detected');
      expect(incident?.affectedUser).toBe('test@example.com');
      expect(incident?.metadata.failureCount).toBe(10);
      expect(incident?.resolved).toBe(false);
    });

    it('tracks suspicious activity incidents', () => {
      const incidentData = {
        type: 'suspicious_activity' as const,
        severity: 'medium' as const,
        description: 'Login from new IP address',
        affectedUser: 'test@example.com',
        resolved: false,
        metadata: {
          newIp: '192.168.1.100',
          previousIp: '192.168.1.1'
        }
      };

      authAnalytics.trackIncident(incidentData);

      const incidents = authAnalytics.getIncidents({ type: 'suspicious_activity' });
      expect(incidents).toHaveLength(1);
      
      const incident = incidents[0];
      expect(incident?.type).toBe('suspicious_activity');
      expect(incident?.severity).toBe('medium');
      expect(incident?.metadata.newIp).toBe('192.168.1.100');
    });

    it('resolves incidents', () => {
      const incidentData = {
        type: 'brute_force' as const,
        severity: 'high' as const,
        description: 'Test incident',
        affectedUser: 'test@example.com',
        resolved: false,
        metadata: {}
      };

      authAnalytics.trackIncident(incidentData);

      const incidents = authAnalytics.getIncidents({ type: 'brute_force' });
      const incidentId = incidents[0]?.id;

      if (incidentId) {
        authAnalytics.resolveIncident(incidentId);

        const resolvedIncidents = authAnalytics.getIncidents({ resolved: true });
        expect(resolvedIncidents).toHaveLength(1);
        expect(resolvedIncidents[0]?.resolved).toBe(true);
        expect(resolvedIncidents[0]?.resolvedAt).toBeDefined();
      }
    });
  });

  describe('Performance Metrics', () => {
    it('tracks performance metrics', () => {
      const metricData = {
        name: 'login_time',
        value: 1500,
        unit: 'ms',
        metadata: { eventType: 'login' }
      };

      authAnalytics.trackMetric(metricData);

      const metrics = authAnalytics.getMetrics({ name: 'login_time' });
      expect(metrics).toHaveLength(1);
      
      const metric = metrics[0];
      expect(metric?.name).toBe('login_time');
      expect(metric?.value).toBe(1500);
      expect(metric?.unit).toBe('ms');
      expect(metric?.metadata.eventType).toBe('login');
    });

    it('filters metrics by time range', () => {
      const metricData = {
        name: 'login_time',
        value: 1500,
        unit: 'ms'
      };

      authAnalytics.trackMetric(metricData);

      const now = Date.now();
      const metrics = authAnalytics.getMetrics({ 
        startTime: now - 1000,
        endTime: now + 1000
      });
      
      expect(metrics).toHaveLength(1);
    });
  });

  describe('Analytics Queries', () => {
    beforeEach(() => {
      // Add test data
      trackLogin({
        userId: 'user1',
        email: 'user1@example.com',
        success: true,
        loginTime: 1000
      });

      trackLogin({
        userId: 'user2',
        email: 'user2@example.com',
        success: true,
        loginTime: 1200
      });

      trackFailedLogin({
        email: 'user1@example.com',
        reason: 'Invalid password'
      });

      trackLogout({
        userId: 'user1',
        email: 'user1@example.com'
      });
    });

    it('filters events by type', () => {
      const loginEvents = authAnalytics.getEvents({ type: 'login' });
      const failedEvents = authAnalytics.getEvents({ type: 'failed_login' });
      const logoutEvents = authAnalytics.getEvents({ type: 'logout' });

      expect(loginEvents).toHaveLength(2);
      expect(failedEvents).toHaveLength(1);
      expect(logoutEvents).toHaveLength(1);
    });

    it('filters events by user', () => {
      const user1Events = authAnalytics.getEvents({ userId: 'user1' });
      const user2Events = authAnalytics.getEvents({ userId: 'user2' });

      expect(user1Events).toHaveLength(2); // login + logout
      expect(user2Events).toHaveLength(1); // login only
    });

    it('filters events by email', () => {
      const user1Events = authAnalytics.getEvents({ email: 'user1@example.com' });
      const user2Events = authAnalytics.getEvents({ email: 'user2@example.com' });

      expect(user1Events).toHaveLength(3); // login + failed_login + logout
      expect(user2Events).toHaveLength(1); // login only
    });

    it('filters events by success status', () => {
      const successfulEvents = authAnalytics.getEvents({ success: true });
      const failedEvents = authAnalytics.getEvents({ success: false });

      expect(successfulEvents).toHaveLength(3); // 2 logins + 1 logout
      expect(failedEvents).toHaveLength(1); // 1 failed login
    });

    it('filters events by time range', () => {
      const now = Date.now();
      const recentEvents = authAnalytics.getEvents({ 
        startTime: now - 1000,
        endTime: now + 1000
      });

      expect(recentEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics Calculations', () => {
    beforeEach(() => {
      // Add test data for calculations
      trackLogin({ email: 'user1@example.com', success: true, loginTime: 1000 });
      trackLogin({ email: 'user2@example.com', success: true, loginTime: 1200 });
      trackLogin({ email: 'user3@example.com', success: true, loginTime: 800 });
      trackFailedLogin({ email: 'user1@example.com', reason: 'Invalid password' });
      trackFailedLogin({ email: 'user1@example.com', reason: 'Invalid password' });
    });

    it('calculates login success rate', () => {
      const successRate = authAnalytics.getLoginSuccessRate();
      
      // 3 successful logins out of 5 total attempts = 60%
      expect(successRate).toBe(60);
    });

    it('counts failed login attempts', () => {
      const failedAttempts = authAnalytics.getFailedLoginAttempts();
      expect(failedAttempts).toBe(2);
    });

    it('counts active users', () => {
      const activeUsers = authAnalytics.getActiveUsers();
      expect(activeUsers).toBe(3); // user1, user2, user3
    });

    it('calculates average login time', () => {
      const avgLoginTime = authAnalytics.getAverageLoginTime();
      // (1000 + 1200 + 800) / 3 = 1000
      expect(avgLoginTime).toBe(1000);
    });

    it('counts security incidents', () => {
      const incidentCount = authAnalytics.getSecurityIncidentCount();
      expect(incidentCount).toBe(0); // No incidents added in this test
    });
  });

  describe('Dashboard Data', () => {
    beforeEach(() => {
      // Add comprehensive test data
      trackLogin({ email: 'user1@example.com', success: true, loginTime: 1000 });
      trackLogin({ email: 'user2@example.com', success: true, loginTime: 1200 });
      trackFailedLogin({ email: 'user1@example.com', reason: 'Invalid password' });
      
      authAnalytics.trackIncident({
        type: 'brute_force',
        severity: 'high',
        description: 'Test incident',
        affectedUser: 'user1@example.com',
        resolved: false,
        metadata: {}
      });

      authAnalytics.trackMetric({
        name: 'login_time',
        value: 1000,
        unit: 'ms'
      });
    });

    it('provides complete dashboard data', () => {
      const dashboardData = authAnalytics.getDashboardData();

      expect(dashboardData).toHaveProperty('loginSuccessRate');
      expect(dashboardData).toHaveProperty('failedLoginAttempts');
      expect(dashboardData).toHaveProperty('activeUsers');
      expect(dashboardData).toHaveProperty('securityIncidents');
      expect(dashboardData).toHaveProperty('averageLoginTime');
      expect(dashboardData).toHaveProperty('recentEvents');
      expect(dashboardData).toHaveProperty('recentIncidents');
      expect(dashboardData).toHaveProperty('loginTrend');
      expect(dashboardData).toHaveProperty('securityTrend');

      expect(dashboardData.loginSuccessRate).toBe(66.67); // 2 out of 3
      expect(dashboardData.failedLoginAttempts).toBe(1);
      expect(dashboardData.activeUsers).toBe(2);
      expect(dashboardData.securityIncidents).toBe(1);
      expect(dashboardData.averageLoginTime).toBe(1100);
    });

    it('provides recent events', () => {
      const dashboardData = authAnalytics.getDashboardData();
      
      expect(dashboardData.recentEvents.length).toBeGreaterThan(0);
      expect(dashboardData.recentEvents.length).toBeLessThanOrEqual(10);
    });

    it('provides recent incidents', () => {
      const dashboardData = authAnalytics.getDashboardData();
      
      expect(dashboardData.recentIncidents.length).toBeGreaterThan(0);
      expect(dashboardData.recentIncidents.length).toBeLessThanOrEqual(5);
    });

    it('provides login trend data', () => {
      const dashboardData = authAnalytics.getDashboardData();
      
      expect(Array.isArray(dashboardData.loginTrend)).toBe(true);
      expect(dashboardData.loginTrend.length).toBeGreaterThan(0);
    });

    it('provides security trend data', () => {
      const dashboardData = authAnalytics.getDashboardData();
      
      expect(Array.isArray(dashboardData.securityTrend)).toBe(true);
    });
  });

  describe('Data Management', () => {
    it('exports data correctly', () => {
      trackLogin({ email: 'test@example.com', success: true });
      authAnalytics.trackIncident({
        type: 'brute_force',
        severity: 'high',
        description: 'Test',
        resolved: false,
        metadata: {}
      });
      authAnalytics.trackMetric({
        name: 'test_metric',
        value: 100,
        unit: 'ms'
      });

      const exportedData = authAnalytics.exportData();

      expect(exportedData.events).toHaveLength(1);
      expect(exportedData.incidents).toHaveLength(1);
      expect(exportedData.metrics).toHaveLength(1);
    });

    it('clears data correctly', () => {
      trackLogin({ email: 'test@example.com', success: true });
      authAnalytics.trackIncident({
        type: 'brute_force',
        severity: 'high',
        description: 'Test',
        resolved: false,
        metadata: {}
      });

      authAnalytics.clearData();

      const events = authAnalytics.getEvents();
      const incidents = authAnalytics.getIncidents();
      const metrics = authAnalytics.getMetrics();

      expect(events).toHaveLength(0);
      expect(incidents).toHaveLength(0);
      expect(metrics).toHaveLength(0);
    });
  });

  describe('Storage Integration', () => {
    it('saves data to localStorage', () => {
      trackLogin({ email: 'test@example.com', success: true });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'auth_analytics_events',
        expect.any(String)
      );
    });

    it('loads data from localStorage', () => {
      const mockEvents = [
        {
          id: 'test-id',
          timestamp: Date.now(),
          type: 'login',
          email: 'test@example.com',
          success: true,
          metadata: {}
        }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockEvents));

      // Create new instance to trigger loading
      const newAnalytics = new (require('../auth-analytics').AuthAnalytics)();
      const events = newAnalytics.getEvents();

      expect(events).toHaveLength(1);
      expect(events[0]?.email).toBe('test@example.com');
    });

    it('handles storage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        trackLogin({ email: 'test@example.com', success: true });
      }).not.toThrow();
    });
  });

  describe('Data Limits', () => {
    it('respects maximum event count', () => {
      // Add more than max events
      for (let i = 0; i < 1100; i++) {
        trackLogin({ email: `user${i}@example.com`, success: true });
      }

      const events = authAnalytics.getEvents();
      expect(events.length).toBeLessThanOrEqual(1000);
    });

    it('respects maximum incident count', () => {
      // Add more than max incidents
      for (let i = 0; i < 110; i++) {
        authAnalytics.trackIncident({
          type: 'brute_force',
          severity: 'high',
          description: `Incident ${i}`,
          resolved: false,
          metadata: {}
        });
      }

      const incidents = authAnalytics.getIncidents();
      expect(incidents.length).toBeLessThanOrEqual(100);
    });

    it('respects maximum metric count', () => {
      // Add more than max metrics
      for (let i = 0; i < 510; i++) {
        authAnalytics.trackMetric({
          name: `metric_${i}`,
          value: i,
          unit: 'ms'
        });
      }

      const metrics = authAnalytics.getMetrics();
      expect(metrics.length).toBeLessThanOrEqual(500);
    });
  });

  describe('Time-based Filtering', () => {
    it('filters events by time window', () => {
      const now = Date.now();
      
      // Add events with different timestamps
      trackLogin({ email: 'recent@example.com', success: true });
      
      // Simulate older event
      const oldEvent = {
        id: 'old-event',
        timestamp: now - (2 * 24 * 60 * 60 * 1000), // 2 days ago
        type: 'login' as const,
        email: 'old@example.com',
        success: true,
        metadata: {}
      };
      
      // Manually add old event
      const analytics = authAnalytics as any;
      analytics.events.push(oldEvent);

      const recentEvents = authAnalytics.getEvents({ 
        startTime: now - (24 * 60 * 60 * 1000) // Last 24 hours
      });

      expect(recentEvents.length).toBe(1);
      expect(recentEvents[0]?.email).toBe('recent@example.com');
    });
  });
});
