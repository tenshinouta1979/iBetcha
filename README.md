# iBetcha

A simple mobile betting platform that helps users create quick challenges with clear conditions and agreed stakes. Once both sides commit, the app tracks the terms, holds the wager amount, and awards the full pot to the verified winner.

## 🎯 Pre-Authorization Escrow System

This implementation uses **credit card pre-authorization** (the same mechanism hotels use to hold funds) to ensure fair and secure betting without the platform ever holding user funds.

### How It Works

1. **Users enter their card** 
   - Each user adds their payment method securely via Stripe

2. **App pre-authorizes the wager amount**
   - When creating or joining a bet, the system pre-authorizes (holds) the exact amount
   - No money moves. No income. No tax.
   - Funds are simply locked on their card

3. **Winner is declared**
   - **Loser's card is charged** - Pre-authorization is captured
   - **Winner receives payout** - Money flows directly from loser via Stripe
   - **You never touch the money** - Platform never holds the pot

### Why This Solution Works

✅ **Users cannot back out** — Funds are already reserved on their card  
✅ **No regulatory risk** — Platform never holds the pot, avoiding money transmitter licenses  
✅ **Fair and automatic** — Everything happens via the payment processor  
✅ **Industry standard** — Payment processors already support this flow  
✅ **Legally safe** — No income, no tax implications, no regulatory burden  

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Stripe account (free test mode available)

### Installation

```bash
# Clone the repository
git clone https://github.com/tenshinouta1979/iBetcha.git
cd iBetcha

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Stripe test key to .env
# STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Build the project
npm run build

# Start the server
npm start
```

The API will be running at `http://localhost:3000`

### Development Mode

```bash
npm run dev
```

## 📚 Documentation

- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Complete implementation guide and architecture
- **[API.md](./API.md)** - Full API documentation with examples
- **[.env.example](./.env.example)** - Environment variables template

## 🔑 Key Features

- ✅ Credit card pre-authorization (hold) without charging
- ✅ Automatic payment capture when winner is declared
- ✅ Automatic release of holds when bet is cancelled
- ✅ Direct payment flow from loser to winner
- ✅ Platform never touches user funds
- ✅ Built-in Stripe integration
- ✅ Transaction history and audit trail
- ✅ RESTful API for mobile app integration

## 🏗️ Architecture

```
┌─────────────┐
│   User A    │───┐
└─────────────┘   │
                  │  Pre-authorize
┌─────────────┐   │  both cards
│   User B    │───┤
└─────────────┘   │
                  ↓
         ┌────────────────┐
         │  iBetcha API   │
         │  (Orchestrator)│
         └────────┬───────┘
                  │
                  ↓
         ┌────────────────┐
         │     Stripe     │
         │ (Payment Proc.)│
         └────────────────┘
         
Winner declared:
- Loser charged via Stripe
- Winner's hold released
- Money: Loser → Winner (via Stripe)
```

## 📖 API Examples

### Create a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'
```

### Create a Bet (Pre-Authorize)
```bash
curl -X POST http://localhost:3000/api/bets \
  -H "Content-Type: application/json" \
  -d '{
    "creatorId":"user-id",
    "description":"I bet I can beat you at chess",
    "amount":5000,
    "paymentMethodId":"pm_card_visa"
  }'
```

### Declare Winner (Process Payment)
```bash
curl -X POST http://localhost:3000/api/bets/{betId}/declare-winner \
  -H "Content-Type: application/json" \
  -d '{"winnerId":"user-id"}'
```

See [API.md](./API.md) for complete API documentation.

## 🧪 Testing

Use Stripe's test payment methods:
- `pm_card_visa` - Successful charge
- `pm_card_chargeDeclined` - Declined charge
- `pm_card_chargeDeclinedInsufficientFunds` - Insufficient funds

## 🔒 Security & Compliance

- ✅ All payment data handled by Stripe (PCI-DSS compliant)
- ✅ No credit card numbers stored in application
- ✅ Pre-authorizations automatically expire
- ✅ Authorization tracking prevents double-charging
- ✅ Transaction logging for audit trail
- ✅ Platform never holds user funds (no regulatory risk)

## 🏭 Production Readiness

Before going to production:
- [ ] Switch to Stripe production keys
- [ ] Implement user authentication (JWT/OAuth)
- [ ] Add database persistence (PostgreSQL/MongoDB)
- [ ] Set up monitoring and logging
- [ ] Implement Stripe webhooks
- [ ] Add email notifications
- [ ] Implement rate limiting
- [ ] Set up backup and disaster recovery

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for detailed production considerations.

## 📄 License

See [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
