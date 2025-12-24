# Platform Fee & Payout Configuration

## 📊 Updated Fee Structure (15% Platform Commission)

### Platform Commission Tiers

| Tier | Rate | Description |
|------|------|-------------|
| **Standard** | **15%** | Default rate for all creators |
| **Premium** | **10%** | High-volume creators (negotiated) |
| **Promotional** | **5%** | New creators (first 3 months) |

### Creator Earnings Breakdown

**Example: ₹10,000 subscription payment via UPI**

| Component | Amount | Percentage |
|-----------|--------|------------|
| Gross Amount | ₹10,000 | 100% |
| Payment Fee (UPI) | ₹200 | 2% |
| Platform Commission | ₹1,500 | 15% |
| **Creator Earnings** | **₹8,300** | **83%** |

**Example: ₹10,000 subscription payment via Card**

| Component | Amount | Percentage |
|-----------|--------|------------|
| Gross Amount | ₹10,000 | 100% |
| Payment Fee (Card) | ₹250 | 2.5% |
| Platform Commission | ₹1,500 | 15% |
| **Creator Earnings** | **₹8,250** | **82.5%** |

---

## 💰 Payout Configuration

### Minimum Payout Thresholds

| Currency | Minimum Balance | Description |
|----------|----------------|-------------|
| INR | ₹500 | Minimum to request payout |
| NPR | NPR 1,000 | Minimum to request payout |
| USD | $10 | Minimum to request payout |

### Maximum Payout Limits (Per Transaction)

| Currency | Maximum Amount | Purpose |
|----------|---------------|---------|
| INR | ₹100,000 | Anti-fraud protection |
| NPR | NPR 200,000 | Anti-fraud protection |
| USD | $5,000 | Anti-fraud protection |

> **Note**: For payouts exceeding the maximum limit, creators should contact support for manual processing.

---

## 📅 Payout Schedule Options

### Available Frequencies

| Frequency | Schedule | Description |
|-----------|----------|-------------|
| **Weekly** | Every Monday | Fastest payout option |
| **Bi-weekly** | Every 2 weeks (Monday) | Balance between speed and processing |
| **Monthly** | 1st of each month | Default option |

### Processing Timeline

```
Transaction → Hold Period (14 days) → Eligible for Payout → Processing (7 days) → Paid
```

| Stage | Duration | Purpose |
|-------|----------|---------|
| **Hold Period** | 14 days | Chargeback protection |
| **Processing** | 7 days | Bank transfer processing |
| **Total** | ~21 days | From transaction to payout |

---

## 🔐 Payout Rules & Policies

### Eligibility Requirements

1. ✅ Balance must meet minimum threshold
2. ✅ Funds must be past 14-day hold period
3. ✅ Valid bank account/payment method on file
4. ✅ KYC verification completed (if required)

### Automatic Payouts

- **Enabled by default** for monthly schedule
- Processes on the 1st of each month
- Only processes if balance ≥ minimum threshold

### Manual Payouts

- Available for balances above threshold
- Subject to minimum 7-day gap between payouts
- Processed within 7 business days

---

## 📈 Revenue Projections

### Example: Creator with 100 Subscribers at ₹199/month

| Metric | Amount (Monthly) | Amount (Annual) |
|--------|------------------|-----------------|
| Gross Revenue | ₹19,900 | ₹2,38,800 |
| Payment Fees (2%) | ₹398 | ₹4,776 |
| Platform Fee (15%) | ₹2,985 | ₹35,820 |
| **Creator Earnings** | **₹16,517** | **₹1,98,204** |

**Creator Share**: ~83% of gross revenue

---

## 🔄 Comparison with Competitors

| Platform | Platform Fee | Payment Fee | Creator Share |
|----------|-------------|-------------|---------------|
| **CreatorConnect** | **15%** | 2-3% | **~82-83%** |
| Patreon | 8-12% | 2.9% + $0.30 | ~85-88% |
| Buy Me a Coffee | 5% | 2.9% + $0.30 | ~92% |
| OnlyFans | 20% | 2-3% | ~77-78% |

**Competitive Advantage**: Lower than OnlyFans, competitive with Patreon, with local payment methods (UPI) reducing total fees.

---

## 🛠️ Environment Variables

Add to your `.env` file:

```bash
# Platform commission (15% of gross transaction)
PLATFORM_FEE_PERCENT=15

# Payout thresholds (in smallest currency unit)
PAYOUT_THRESHOLD_INR=50000    # ₹500
PAYOUT_THRESHOLD_NPR=100000   # NPR 1000
PAYOUT_THRESHOLD_USD=1000     # $10

# Payout frequency: weekly, biweekly, monthly
PAYOUT_FREQUENCY=monthly

# Processing timeline
PAYOUT_PROCESSING_DAYS=7      # Days to process payout
PAYOUT_HOLD_PERIOD=14         # Days to hold funds

# Maximum payout limits (anti-fraud)
PAYOUT_MAX_INR=10000000       # ₹100,000
PAYOUT_MAX_NPR=20000000       # NPR 200,000
PAYOUT_MAX_USD=500000         # $5,000
```

---

## 📝 Implementation Notes

### Code Changes

1. **Updated** `PLATFORM_COMMISSION.STANDARD` from 10% to 15%
2. **Added** `PAYOUT_LIMITS` for maximum payout amounts
3. **Enhanced** `PAYOUT_SCHEDULE` with multiple frequency options
4. **Added** `validatePayoutAmount()` function for validation
5. **Updated** `checkPayoutEligibility()` to include max limit warnings

### Files Modified

- `.env.example` - Added payout configuration
- `src/lib/pricing/config.ts` - Updated commission rates and payout config
- `src/lib/pricing/earnings.ts` - Enhanced payout validation
- `src/lib/pricing/index.ts` - Exported new functions

---

## 🎯 Next Steps

1. **Update UI** to show new fee breakdown to creators
2. **Add payout frequency selector** in creator settings
3. **Implement payout request API** with validation
4. **Add payout history page** for creators
5. **Send email notifications** for payout processing
