# Supply Chain & Profit - Operations Runbook

## Daily Cadence

### 1. Imports (Daily)
- **Location**: `/imports`
- **Process**: Upload CSV files → Map headers → Save mapping → Ingest
- **Order**: Products → Orders → Purchase Orders → Events → Settlements
- **Verification**: Check that all files show "Ingested" status

### 2. Calculator (As needed)
- **Location**: `/calculator`
- **Purpose**: Review profit margins and calculations
- **Key metrics**: Revenue, Profit, Margin %, Landed Cost
- **Color coding**: Green (≥10%), Yellow (5-10%), Red (<5%)

### 3. SLA Alerts (Continuous)
- **Location**: Alerts drawer (top-right button)
- **Monitoring**: Automatic every 60 seconds
- **Red alerts**: Critical, require immediate attention
- **Yellow alerts**: Warning, monitor closely
- **Battery products**: Get extra days for customs clearance

### 4. Orders (Daily)
- **Location**: `/orders`
- **Process**: Review aging orders → Step 1 acknowledgment → Step 2 (if different user)
- **Two-person rule**: Step 2 disabled if same user did Step 1
- **Top 10 aging**: Pinned at top for priority attention

### 5. Reconcile (Weekly)
- **Location**: `/reconcile`
- **Purpose**: Compare expected vs actual fees
- **Tolerance**: max(₹5, 0.8% of net sales)
- **Status**: OK (within tolerance) or Mismatch (above threshold)
- **Variance %**: Shown in header KPI

### 6. Cashflow (As needed)
- **Location**: `/cashflow`
- **Inputs**: Opening balance, horizon days, settlement lag, FX rate
- **Outputs**: Daily balances, runway days, cashflow events
- **Use case**: Planning and forecasting

### 7. Validator (As needed)
- **Location**: `/validator`
- **Purpose**: Validate data quality and consistency
- **Input**: Paste CSV/TSV data
- **Output**: Issues with severity levels (info/warn/error)

## Backup & Restore

### Export Backup
1. Go to `/settings`
2. Scroll to "Data Management"
3. Click "Export Backup"
4. Downloads `scp-backup.json` containing:
   - All rate settings
   - Import mappings
   - SLA settings
   - User configurations

### Import Backup
1. Go to `/settings`
2. Scroll to "Data Management"
3. Click "Import Backup"
4. Select backup file
5. Confirm overwrite
6. App reloads with restored settings

## Reset Safety

### When to Reset
- Corrupted data state
- Major configuration issues
- Starting fresh

### Reset Process
1. Go to `/settings`
2. Scroll to "Data Management"
3. Click "Reset Local Data"
4. Type "RESET" exactly (case-sensitive)
5. App clears all data and reloads

### What Gets Reset
- All imported datasets
- All mappings
- All settings
- All user data
- LocalStorage completely cleared

## Two-Person Rule

### Setup
1. Go to `/users`
2. Add users with email and role (ops/finance)
3. Set current user from dropdown
4. Enable two-person rule in `/settings`

### How It Works
- **Step 1**: First user acknowledges order
- **Step 2**: Different user must complete (same user disabled)
- **Purpose**: Prevent single-point-of-failure
- **Override**: Disable rule in settings if needed

## Reconcile Tolerance

### Formula
```
threshold = max(₹5, 0.008 × netSalesNetGST)
```

### Interpretation
- **OK**: Difference within threshold
- **Mismatch**: Difference exceeds threshold
- **Common causes**: 
  - Rate changes after order
  - Fee structure updates
  - Data entry errors

### Investigation Steps
1. Check expected fees calculation
2. Verify settlement data accuracy
3. Review rate settings at time of order
4. Check for data mapping issues

## KPIs Explained

### Header Tiles
- **Revenue**: Total sales (net of GST)
- **Profit**: Revenue minus all costs
- **Orders**: Number of active orders
- **Avg Margin**: Average profit margin percentage
- **Settlement Variance**: Reconciliation variance percentage

### "Weird" Numbers
- **Zero revenue**: No orders imported or mapping issues
- **Negative profit**: High costs relative to sales
- **High variance**: Fee calculation mismatches
- **Missing data**: Import or mapping problems

## Testing & Verification

### E2E Smoke Test
```bash
npm run e2e:smoke -- --project=chromium
```
- Verifies basic app functionality
- Tests navigation and core features
- Should pass in under 2 seconds

### E2E Full Test
```bash
npm run e2e:full
```
- Complete workflow test
- Imports sample data
- Tests all features end-to-end
- Generates trace for debugging

### Local Verification
```bash
npm run typecheck  # TypeScript errors
npm run lint       # Code quality
npm run test:unit  # Unit tests
npm run build      # Production build
```

## CI/CD Artifacts

### GitHub Actions
- **Location**: GitHub → Actions tab
- **CI workflow**: Runs on every push/PR
- **Artifacts**: 
  - `playwright-report`: E2E test results
  - `web-dist`: Production build files

### Playwright Reports
- **Access**: Actions → Workflow run → Artifacts
- **Content**: HTML reports with screenshots and traces
- **Use case**: Debugging failed E2E tests

### Release Process
- **Manual trigger**: Actions → Release workflow
- **Input**: Version number (e.g., 1.0.2)
- **Output**: GitHub release with build artifacts
- **Notes**: Automatically extracts from CHANGELOG.md
