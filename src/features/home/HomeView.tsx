import React from "react";
import { Link } from "react-router-dom";

export default function HomeView() {
  React.useEffect(() => {
    // Hide any global chrome (header/sidebar) on the public homepage
    document.body.classList.add("public-page");
    return () => document.body.classList.remove("public-page");
  }, []);

  return (
    <main
      data-testid="home-view"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "#f8fafc",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 920,
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Supply Chain & Profit — Internal Portal
        </h1>
        <p style={{ color: "#6b7280", marginBottom: 20 }}>
          A lightweight tool for day-to-day operations and finance teams.
        </p>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            marginBottom: 20,
          }}
        >
          <article
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              background: "#f9fafb",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              What Operations can do
            </h2>
            <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Import and validate order CSVs</li>
              <li>Track revenue, orders and margins</li>
              <li>Run SLA & reconciliation checks</li>
              <li>Use validator to resolve data issues</li>
            </ul>
          </article>

          <article
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              background: "#f9fafb",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              What Finance can do
            </h2>
            <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Monitor cashflow & settlements</li>
              <li>Analyze profit and variance</li>
              <li>Reconcile payouts and fees</li>
              <li>Export reports for accounting</li>
            </ul>
          </article>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            to="/login"
            data-testid="cta-login"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid #2563eb",
            }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            data-testid="cta-register"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "#fff",
              color: "#111827",
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid #e5e7eb",
            }}
          >
            Register
          </Link>
        </div>
      </section>
    </main>
  );
}
