# Sample CSV Files

This directory contains sample CSV files that demonstrate the expected format for each file type in the Supply Chain & Profit application.

## File Types

### 1. keepa.csv
**Purpose**: Product catalog data from Keepa
**Columns**: ASIN, Category, Subcategory, MainCategory, Weight, WeightUnit, Dimensions, BatteryFlag
**Notes**: 
- BatteryFlag affects SLA calculations (extra days for battery products)
- Weights are used for freight calculations
- Categories influence referral percentage ranges

### 2. india_listings.csv
**Purpose**: Amazon India listing data
**Columns**: ASIN, SKU, SellingPriceINR, BuyerShippingINR, CommissionValue, CommissionMode, Channel
**Notes**:
- CommissionMode can be 'manual' or 'keepa'
- Channel affects fee calculations (FBA vs FBM)
- SellingPriceINR is the primary revenue driver

### 3. uspo.csv
**Purpose**: US Purchase Order data
**Columns**: ASIN, Vendor, UnitUSD, Qty, Status, OrderDate, ShippedDate, Tracking
**Notes**:
- UnitUSD is converted to INR using FX rate
- Qty affects total landed cost calculations
- Status is used for order tracking

### 4. events.csv
**Purpose**: Supply chain event timeline
**Columns**: ASIN, Event, Date, Carrier, Tracking
**Notes**:
- Events trigger SLA monitoring
- Battery products get extra days for customs
- Used for analytics and cashflow calculations

### 5. settlement.csv
**Purpose**: Settlement and fee data
**Columns**: ASIN, SKU, FeesTotalINR, NetAmountINR, Date
**Notes**:
- Used for reconciliation against expected fees
- Variance threshold: max(₹5, 0.8% of net sales)
- Mismatches appear in reconcile view

## Import Process

1. **Go to /imports** in the application
2. **Upload files in this order**:
   - keepa.csv (products)
   - india_listings.csv (orders)
   - uspo.csv (purchase orders)
   - events.csv (timeline)
   - settlement.csv (settlements)

3. **For each file**:
   - Upload the CSV
   - Review the header mapping (should auto-detect)
   - Click "Save Mapping"
   - Click "Ingest"

4. **Verify data**:
   - Check /calculator for profit calculations
   - Check /analytics for segment averages
   - Check /reconcile for settlement variance

## Sample Data Notes

- **Quantities and weights are illustrative** - adjust for your use case
- **Battery flag behavior**: B08F7PTF54 has BatteryFlag=true, gets extra customs days
- **SLA alerts**: The events sample includes a complete timeline that should trigger analytics
- **Reconciliation**: Settlement data is designed to show variance calculations

## Troubleshooting

- **Mapping issues**: Ensure column names match exactly
- **No data showing**: Check that all files are ingested successfully
- **Calculation errors**: Verify FX rate in Settings (default: 84)
- **SLA alerts**: Battery products need extra time for customs clearance
