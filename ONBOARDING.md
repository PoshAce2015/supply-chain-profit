# Supply Chain & Profit - Quick Onboarding

## 15-Minute Quickstart

### 1. Setup Environment
```bash
# Clone the repository
git clone <repository-url>
cd supply-chain-profit

# Install dependencies
npm ci

# Start development server
npm run dev
```

**Expected**: App opens at `http://localhost:5174` with header showing KPIs

### 2. Import Sample Data
1. **Navigate to `/imports`**
2. **Upload files in order**:
   - `Attachment Doc/Amazon.com(purchase data).csv` → Save Mapping → Ingest
   - `Attachment Doc/Amazon Sellercentral(sales data).txt` → Save Mapping → Ingest
   - `Attachment Doc/Transactions in the last 30 days.csv` → Save Mapping → Ingest


**Expected**: All files show "Ingested" status

### 3. Explore Calculator
1. **Navigate to `/calculator`**
2. **Verify data**: Should see 3 rows with profit calculations
3. **Check margins**: Color-coded badges (green/yellow/red)
4. **Note**: Profit and revenue should be non-zero

### 4. Test Settings Impact
1. **Navigate to `/settings`**
2. **Change FX rate**: From 84 to 90
3. **Save rates**
4. **Return to `/calculator`**
5. **Observe**: Profit margins change due to higher USD cost

### 5. Trigger Alerts
1. **Navigate to `/analytics`**
2. **Verify**: Four tiles show segment averages
3. **Check alerts**: Click top-right alerts button
4. **Expected**: Alerts drawer opens (may be empty with sample data)

### 6. Test Reconciliation
1. **Navigate to `/reconcile`**
2. **Verify**: Settlement variance % shows in header
3. **Check table**: Should show reconciliation rows
4. **Note**: Status should be OK or Mismatch based on thresholds

### 7. Export Mappings
1. **Navigate to `/imports`**
2. **Click "Export Mappings"**
3. **Verify**: Downloads `mappings.json`
4. **Purpose**: Backup your header mappings

### 8. Create Backup
1. **Navigate to `/settings`**
2. **Scroll to "Data Management"**
3. **Click "Export Backup"**
4. **Verify**: Downloads `scp-backup.json`
5. **Purpose**: Complete backup of settings and mappings

## Key Concepts

### Data Flow
1. **CSV Import** → Header mapping → Data ingestion
2. **Calculator** → Profit calculations → Margin analysis
3. **Analytics** → Segment performance → Trend analysis
4. **SLA** → Event monitoring → Alert generation
5. **Reconcile** → Fee comparison → Variance analysis

### Important Settings
- **FX Rate**: USD to INR conversion (affects all costs)
- **GST Rates**: Tax calculations (affects revenue)
- **SLA Thresholds**: Alert timing (affects monitoring)
- **Two-Person Rule**: Order acknowledgment workflow

### Common Operations
- **Daily**: Import new data, check alerts, review orders
- **Weekly**: Reconcile settlements, review analytics
- **As needed**: Cashflow planning, data validation

## What NOT to Do

### ❌ Don't Add Dependencies
- No new npm packages without approval
- No external libraries or frameworks
- Keep the tech stack locked

### ❌ Don't Enable Network Calls
- This is a local-first application
- No API calls or external services
- All processing happens in the browser

### ❌ Don't Skip Testing
- Always run `npm run e2e:smoke` before committing
- Verify typecheck and lint pass
- Test with sample data before real data

### ❌ Don't Ignore Alerts
- Red alerts require immediate attention
- Yellow alerts need monitoring
- Check alerts drawer regularly

## Troubleshooting

### App Won't Start
```bash
# Check Node version
node --version  # Should be 20.x

# Clear dependencies
rm -rf node_modules package-lock.json
npm ci
```

### No Data Showing
1. Check that files are ingested in `/imports`
2. Verify header mappings are correct
3. Check browser console for errors
4. Try importing sample data first

### Calculation Errors
1. Check FX rate in settings
2. Verify GST rates are set
3. Review CSV data format
4. Check for missing required columns

### Performance Issues
1. Limit CSV files to reasonable size (<10k rows)
2. Check browser memory usage
3. Clear browser cache if needed
4. Restart development server

## Next Steps

1. **Read the [RUNBOOK.md](RUNBOOK.md)** for detailed operations
2. **Review [CONTRIBUTING.md](CONTRIBUTING.md)** for development guidelines
3. **Test with your real data** using the sample format
4. **Set up users and two-person rule** if needed
5. **Configure SLA thresholds** for your business

## Support

- **Documentation**: Check `docs/` directory
- **Issues**: Use GitHub issue templates
- **Questions**: Search existing issues first
- **Emergency**: Check [SECURITY.md](SECURITY.md) for security issues
