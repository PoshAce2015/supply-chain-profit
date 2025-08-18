import React from "react";
import { useNavigate, Link } from "react-router-dom";

const IconUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke="#1f2937" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconCalc = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="#111827" strokeWidth="2"/>
    <path d="M8 7h8M8 11h8M8 15h4" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" stroke="#1f2937" strokeWidth="2"/>
    <path d="M9 12l2 2 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="#111827" strokeWidth="2"/>
    <circle cx="12" cy="12" r="3" stroke="#10b981" strokeWidth="2"/>
  </svg>
);
const IconReport = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M7 4h7l5 5v9a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="#1f2937" strokeWidth="2"/>
    <path d="M14 4v6h6" stroke="#9ca3af" strokeWidth="2"/>
    <path d="M9 14h6M9 18h8" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconReconcile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 12a9 9 0 1018 0" stroke="#1f2937" strokeWidth="2"/>
    <path d="M3 12l4-2m14 2l-4 2" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function LandingView() {
  const nav = useNavigate();

  React.useEffect(() => {
    document.body.classList.add("landing-page");
    return () => document.body.classList.remove("landing-page");
  }, []);

  return (
    <div className="landing-wrap" data-testid="landing-view">
      {/* Document Header */}
      <header className="landing-header-section">
        <div className="landing-card">
          <div className="landing-header">
            <h1 className="landing-title">Supply Chain &amp; Profit — Internal Portal</h1>
            <p className="landing-sub">
              A lightweight workspace for day-to-day Operations and Finance teams:
              import orders, validate data, reconcile settlements, and track margins in one place.
            </p>
            <div className="landing-cta">
              <button className="btn" onClick={() => nav("/login")} data-testid="cta-login">Sign in</button>
              <Link to="/register" className="btn secondary" data-testid="cta-register">Register</Link>
            </div>
            <div className="badges" aria-label="quick highlights">
              <span className="badge">Local CSV processing</span>
              <span className="badge">Audit-friendly</span>
              <span className="badge">No vendor lock-in</span>
              <span className="badge">Fast &amp; private</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="landing-main-content">
        <div className="landing-card">
          {/* Feature Overview Section */}
          <section className="feature-grid" aria-label="roles">
            <div className="feature-card">
              <div className="feature-title"><IconShield/> What Operations can do</div>
              <ul style={{marginLeft: 18, lineHeight: 1.6}}>
                <li><IconUpload/> Import &amp; validate order CSVs</li>
                <li><IconCalc/> Track revenue, orders &amp; margins</li>
                <li><IconShield/> Run SLA &amp; reconciliation checks</li>
                <li><IconReport/> Use Validator to resolve data issues</li>
              </ul>
              <div className="kpis">
                <div className="kpi"><div className="kpi-label">Avg margin</div><div className="kpi-value">8.2%</div></div>
                <div className="kpi"><div className="kpi-label">Orders processed</div><div className="kpi-value">12,547</div></div>
                <div className="kpi"><div className="kpi-label">Data issues caught</div><div className="kpi-value">312</div></div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-title"><IconCash/> What Finance can do</div>
              <ul style={{marginLeft: 18, lineHeight: 1.6}}>
                <li><IconCash/> Monitor cashflow &amp; settlements</li>
                <li><IconCalc/> Analyze profit, variance &amp; fees</li>
                <li><IconReconcile/> Reconcile payouts vs. orders</li>
                <li><IconReport/> Export audit-ready reports</li>
              </ul>
              <div className="kpis">
                <div className="kpi"><div className="kpi-label">Settlement variance</div><div className="kpi-value">0.6%</div></div>
                <div className="kpi"><div className="kpi-label">Reports exported</div><div className="kpi-value">238</div></div>
                <div className="kpi"><div className="kpi-label">Time saved / week</div><div className="kpi-value">6.5h</div></div>
              </div>
            </div>
          </section>

          {/* Process Overview Section */}
          <section className="how" aria-label="how it works">
            <div className="how-step">
              <div className="feature-title"><IconUpload/> 1) Import</div>
              <p>Drag &amp; drop your CSVs (orders, settlements) — everything processes locally on your machine.</p>
            </div>
            <div className="how-step">
              <div className="feature-title"><IconShield/> 2) Validate</div>
              <p>Automatic checks flag mismatches, chargebacks, and SLA breaches before they become costly.</p>
            </div>
            <div className="how-step">
              <div className="feature-title"><IconReport/> 3) Decide</div>
              <p>Get clean metrics and exportable reports for finance, audits, and weekly business reviews.</p>
            </div>
          </section>
        </div>
      </main>

      {/* Document Footer */}
      <footer className="landing-footer-section">
        <div className="landing-card">
          <div className="footer-content">
            <div className="footer-links">
              <Link to="/login" className="footer-link">Sign In</Link>
              <Link to="/register" className="footer-link">Register</Link>
              <a href="#privacy" className="footer-link">Privacy</a>
              <a href="#terms" className="footer-link">Terms</a>
            </div>
            <div className="footer-info">
              <p>&copy; 2024 Supply Chain &amp; Profit. Built for internal operations.</p>
              <p className="footer-version">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
