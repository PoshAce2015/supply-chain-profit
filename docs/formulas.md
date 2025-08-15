# Supply Chain & Profit - Formulas & Calculations

## Precision Rules
- **Internal calculations**: 4 decimal places
- **UI display**: 2 decimal places
- **Rounding**: Half-up for all calculations
- **Single boundary**: Rounding only at display layer

## Revenue Calculations

### Revenue Net (GST Excluded)
```typescript
revenueNet = (salePrice + buyerShipping) / (1 + gstSalePercent / 100)
```

### GST on Revenue
```typescript
gstOnRevenue = salePrice + buyerShipping - revenueNet
```

## Fee Calculations

### Rule-Based Fees
```typescript
feesRuleBased = (referralPercent * revenueNet / 100) + 
                closingFee + 
                pickPackFee + 
                (weightHandlingFee * weightLb)
```

### Actual Fees
```typescript
feesActual = actualFeesTotal
```

### GST on Fees
```typescript
gstOnFees = fees * (gstOnFeesPercent / 100)
```

### TCS (Tax Collected at Source)
```typescript
tcs = revenueNet * (tcsPercent / 100)
```

## Landed Cost Calculations

### Landed Cost per Unit
```typescript
landedUnit = (unitUsd * fxRate) + 
             (weightLb * freightRatePerLb) + 
             (unitUsd * fxRate * insurancePercent / 100) +
             clearanceCostPerUnit +
             (unitUsd * fxRate * bcdPercent / 100) +
             (unitUsd * fxRate * igstPercent / 100)
```

### Total Costs for Order
```typescript
totalCosts = landedUnit * quantity + fees + gstOnFees + tcs
```

## Profit & Margin Calculations

### Profit
```typescript
profit = revenueTotal - totalCosts
```

### Margin Percentage
```typescript
marginPercent = (profit / revenueTotal) * 100
```

## Commission Handling

### Commission Precedence
1. Manual commission (absolute or percent) is source of truth
2. Keepa commission percent is fallback only
3. If both present and differ by >0.5 percentage points: flag as "Commission Mismatch"

### Commission Percent Calculation
```typescript
// If manual is absolute
commissionPercent = (manualCommission / revenueNet) * 100

// If manual is percent
commissionPercent = manualCommission

// If only Keepa available
commissionPercent = keepaCommissionPercent
```

## SLA Calculations

### US PO SLA
```typescript
// Default: 12 hours
missedUSPO = (currentTime - orderDate) > slaPOHours
```

### Customs Clearance SLA
```typescript
// Default: 7 days, +3 days for battery items
customsDeadline = clearanceDate + (batteryFlag ? 10 : 7) days
customsTimeout = currentTime > customsDeadline
```

## Settlement Reconciliation

### Expected vs Actual Fees
```typescript
expectedFees = feesPerUnit * quantity
actualFees = settlementFeesTotalINR
variance = Math.abs(expectedFees - actualFees)
```

### Variance Threshold
```typescript
threshold = Math.max(5, revenueNet * 0.008) // ₹5 or 0.8% of net sales
isMismatch = variance > threshold
```

## Unit Conversions

### Weight Conversions
```typescript
// Ounces to Pounds
weightLb = weightOz / 16

// Grams to Pounds
weightLb = weightG / 453.592
```

### Dimension Normalization
```typescript
// Convert all dimensions to inches
lengthInches = lengthCm / 2.54
widthInches = widthCm / 2.54
heightInches = heightCm / 2.54
```

## Cash Flow Simulation

### Outflows
```typescript
// US PO payment
uspoOutflow = unitUsd * quantity * fxRate

// Customs payment
customsOutflow = clearanceCostTotal
```

### Inflows
```typescript
// Payment received
paymentInflow = revenueTotal

// Estimated payment (if not received)
estimatedInflow = revenueTotal // at delivered + settlementLag
```

### Daily Balance
```typescript
dailyBalance = openingBalance + 
               sum(inflows for date) - 
               sum(outflows for date)
```

## Validation Rules

### Sales Price Consistency
```typescript
// Net and gross should be invertible within ₹0.05
calculatedNet = gross / (1 + gstSalePercent / 100)
isConsistent = Math.abs(calculatedNet - net) <= 0.05
```

### GST on Fees Validation
```typescript
// GST on fees should be approximately 18% of eligible fees
expectedGstOnFees = fees * 0.18
tolerance = fees * 0.02 // 2% tolerance
isValid = Math.abs(gstOnFees - expectedGstOnFees) <= tolerance
```

### Referral Percent Sanity
```typescript
// Referral percent should be within category-specific ranges
isValidReferral = referralPercent >= categoryMin && 
                  referralPercent <= categoryMax
```

## Acceptance Test Cases

### Case A: FBA, Rule-Based Fees, Qty 3
- Revenue_net per unit: ₹6,778.81
- Landed_unit: ₹7,754.30
- Revenue total: ₹20,336.44
- TotalCosts: ₹25,411.54
- Profit: ₹−5,075.10
- Margin: −24.96%

### Case B: FBM, Actual Fees, Qty 5
- Revenue_net per unit: ₹2,160.17
- Landed_unit: ₹2,555.64
- Revenue total: ₹10,800.85
- TotalCosts: ₹14,591.33
- Profit: ₹−3,790.48
- Margin: −35.09%

## Error Handling

### Insufficient Data
- Missing required fields marked as "Gray"
- Calculations blocked until data available
- Clear indication of missing fields

### Data Quarantine
- Invalid rows separated with reasons
- Downloadable error report
- Ability to fix and re-import

### Edge Cases
- Zero quantities handled gracefully
- Negative values flagged
- Extreme values logged for review
