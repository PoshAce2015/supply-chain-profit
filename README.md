# Supply Chain & Profit 1.0

![CI](https://img.shields.io/badge/ci-main-green)

A local-first SPA for processing CSV data and calculating profit margins for e-commerce operations. Built with React, TypeScript, and Redux Toolkit.

## 🚀 Quick Start

### Prerequisites
- Node.js 20 LTS (pinned in `.nvmrc`)
- npm

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run e2e:smoke
```

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js 20 LTS
- **Build**: Vite 5 + TypeScript 5 (strict mode)
- **UI**: React 18 + Tailwind CSS + Headless UI
- **State**: Redux Toolkit + redux-persist
- **Data**: Papa Parse + Zod validation
- **Testing**: Vitest + Testing Library + Playwright

### Core Principles
1. **Local-first**: No network calls, all data processed locally
2. **Pure functions**: All calculations are pure and testable
3. **Type safety**: Strict TypeScript with Zod validation
4. **Performance**: Optimized for large datasets (10k+ rows)
5. **Reliability**: Comprehensive error handling and validation

## 📁 Project Structure

```
/src
  /app          # Store, providers, routing, feature flags
  /components   # Reusable UI components
  /features     # Feature-based modules
    /imports    # CSV import and mapping
    /calculator # Margin calculations
    /orders     # Order management
    /sla        # SLA monitoring
    /analytics  # Performance metrics
    /cashflow   # Cash flow simulation
    /reconcile  # Settlement reconciliation
    /validator  # Data validation
    /settings   # App configuration
    /users      # User management
  /lib          # Pure utility functions
    /calc       # Calculation functions
    /selectors  # Redux selectors
    /csv        # CSV schemas and parsers
    /time       # Date/time utilities
    /storage    # Persistence logic
    /colors     # UI color utilities
    /constants  # App constants
    /testdata   # Test fixtures
  /styles       # Global styles
  /docs         # Documentation
```

## 🧮 Calculation Engine

### Precision Rules
- **Internal calculations**: 4 decimal places
- **UI display**: 2 decimal places
- **Rounding**: Half-up for all calculations
- **Single boundary**: Rounding only at display layer

### Key Formulas
- Revenue Net = (salePrice + buyerShipping) / (1 + gstSalePercent / 100)
- Landed Cost = unit cost + freight + insurance + clearance + duties
- Profit = Revenue Total - Total Costs
- Margin % = (Profit / Revenue Total) × 100

See [docs/formulas.md](docs/formulas.md) for complete calculation details.

## 🧪 Testing

### Test Coverage Requirements
- **Unit tests**: 90%+ coverage on `/lib/calc`, `/lib/selectors`, `/features/sla`
- **Integration tests**: Feature workflows
- **E2E tests**: Critical user journeys

### Running Tests
```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E smoke tests
npm run e2e:smoke

# All E2E tests
npm run e2e
```

## 🔧 Development

### Code Quality
- **ESLint**: Strict TypeScript rules, React hooks, accessibility
- **Prettier**: Consistent formatting with import sorting
- **Husky**: Pre-commit hooks for linting and formatting
- **TypeScript**: Strict mode enabled

### Performance Budgets
- CSV parsing: < 2s for 10k rows
- SLA calculations: < 150ms for 5k orders
- First paint: < 1.5s on cold load
- Memory usage: < 100MB for 50k rows

### Cursor AI Guardrails
The project includes Cursor AI guardrails to prevent "creative" modifications:
- `.cursor/rules/00-guardrails.mdc`: Plan-then-act workflow, file limits
- `.cursor/rules/10-architecture.mdc`: SPA structure, precision rules
- `.cursor/rules/20-tests-and-ci.mdc`: Test requirements, CI pipeline

## 📊 Features

### 1. Imports & Mapping
- CSV file upload and parsing
- Header auto-detection and mapping
- Data validation with Zod schemas
- Error quarantine with downloadable reports

### 2. Calculator & Margin Analysis
- Per-row profit margin calculations
- Color-coded margin badges
- Channel toggle (FBA/FBM)
- Fee mode selection (rule-based vs actual)

### 3. Orders & Checklist
- Two-step verification workflow
- Aging pipeline management
- Role-based permissions
- Audit trail tracking

### 4. SLA Monitoring
- Service level agreement tracking
- Alert system with notifications
- Timeline visualization
- Two-person rule enforcement

### 5. Analytics
- Performance metrics and trends
- Chart.js visualizations
- Filter and export capabilities
- Segment analysis

### 6. Cashflow Simulation
- Cash flow modeling and projection
- Daily balance tracking
- Low-balance warnings
- Export capabilities

### 7. Settlement Reconciliation
- Expected vs actual fee comparison
- Variance analysis and thresholds
- Contributor breakdown
- Settlement variance KPI

### 8. Data Validation
- Data quality indicators
- Validation rules and checks
- Error categorization
- Quality scoring

### 9. Settings & Configuration
- Rate and parameter configuration
- SLA settings management
- User preferences
- Data management tools

### 10. User Management
- User roles and permissions
- Audit log display
- Two-person rule configuration
- Activity tracking

## 🔒 Security & Privacy

### Data Handling
- **No network calls**: All processing is local
- **No PII**: No personal data collection
- **LocalStorage only**: Data persists locally
- **One-click reset**: Complete data wipe capability

### File Validation
- Explicit file type checking
- Size limits on uploads
- Malformed data quarantine
- Error reporting for failed imports

## 📈 Performance

### Optimization Strategies
- Lazy loading of large datasets
- Memoized selectors for expensive calculations
- Virtual scrolling for large tables
- Debounced user inputs
- Background processing for heavy operations

### Monitoring
- Performance budgets enforced
- Memory usage tracking
- Load time measurements
- Large dataset handling

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### How We Merge
- All PRs require review from designated CODEOWNERS
- CI must pass (typecheck, lint, unit tests, E2E smoke)
- No network calls allowed
- Max change set: 6 files or 300 LOC
- Calculation changes require unit test proof of no regression

### Code Standards
- TypeScript strict mode everywhere
- No `any` types without documented TODO
- Pure functions for all calculations
- Comprehensive error handling
- Accessibility compliance (WCAG 2.1 AA)

## 📚 Documentation

- [Architecture Guide](docs/architecture.md)
- [Formulas & Calculations](docs/formulas.md)
- [UI & UX Guidelines](docs/ui.md)

## 🎒 Handoff Kit

### Quick Start
- **[ONBOARDING.md](ONBOARDING.md)** - 15-minute quickstart for new operators
- **[RUNBOOK.md](RUNBOOK.md)** - Daily operations and troubleshooting guide
- **[Attachment Doc/](Attachment%20Doc/)** - Comprehensive sample data files for testing
- **Local preview**: run `npm start`, then open http://localhost:5179/imports

### Sample Data
The `Attachment Doc/` directory contains comprehensive sample data files:
- `Amazon.com(purchase data).csv` - Amazon purchase data (630KB, 788 lines)
- `Amazon Sellercentral(sales data).txt` - Amazon sales data (251KB, 509 lines)
- `Transactions in the last 30 days.csv` - Recent transaction data (117KB, 601 lines)
- `3730443_COMMERCIAL_INVOICE.pdf` - Commercial invoice document (43KB)
- `events.csv` - Supply chain timeline
- `settlement.csv` - Settlement and fee data

Import these files in order to see the application in action with real calculations and data.

## 🔄 Release & Recovery

### Build & Preview
```bash
# Production build
npm run build

# Preview production build
npm run preview

# CI build with preview
npm run build:ci
```

### Backup & Restore
- **Export Backup**: Go to Settings → Data Management → Export Backup
  - Downloads `scp-backup.json` with all settings and mappings
- **Import Backup**: Go to Settings → Data Management → Import Backup
  - Select backup file to restore all configurations
  - App will reload after restoration

### Reset Safety
- **Reset Local Data**: Go to Settings → Data Management → Reset Local Data
  - Requires typing "RESET" exactly to confirm
  - Clears all imported data, mappings, and settings
  - App reloads with clean state

### Known Limitations
- **No Network**: Application is completely local-first
- **In-Memory Datasets**: Imported data is not persisted (only mappings are)
- **Browser Storage**: All persistence uses localStorage
- **Single User**: Multi-user features require manual user switching

## 🔄 CI/CD

### Continuous Integration
- **Trigger**: Push/PR to `main` branch
- **Pipeline**: Typecheck → Lint → Unit Tests → E2E Smoke → E2E Full → Build
- **Artifacts**: Playwright reports and build distribution
- **Status**: Required for merge to main

### Release Process
- **Manual Trigger**: Run "Release" workflow from GitHub Actions
- **Input**: Version number (e.g., `1.0.2`)
- **Actions**: 
  - Updates `APP_VERSION` in code
  - Creates Git tag
  - Generates GitHub Release from CHANGELOG.md
  - Uploads build artifacts to release
- **Artifacts**: Complete web distribution in release assets

### Playwright Reports
- **Location**: GitHub Actions → Workflow runs → Artifacts
- **Content**: HTML reports with traces for debugging
- **Access**: Download `playwright-report` artifact from failed runs

## 🔧 Maintenance

### Automated Testing
- **Nightly CI**: Runs smoke tests + build at 02:00 UTC daily
- **Purpose**: Catch regressions automatically
- **Artifacts**: `nightly-playwright-report` in Actions → nightly workflow
- **Manual trigger**: Available via workflow_dispatch

### Dependency Management
- **Dependabot**: Weekly updates for GitHub Actions dependencies
- **Scope**: CI/CD tools only (no app dependencies)
- **Process**: Review + merge if tests pass
- **Labels**: `dependencies`, `ci` automatically applied
- **Reviewers**: ops-team assigned for approval

### Policy
- **No auto-bumps**: App dependencies require manual review
- **CI only**: Actions updates are safe and encouraged
- **Green required**: All tests must pass before merging
- **Rollback**: Revert immediately if nightly fails

## 🚀 Deployment

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

The application is designed to run entirely in the browser with no backend requirements.

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with reliability and precision in mind.** 🎯
<!-- ci-kickoff Fri Aug 15 22:07:36 UTC 2025 -->
