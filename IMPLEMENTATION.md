# Credit Card Pre-Authorization Escrow System

## Overview

This implementation provides a **credit card pre-authorization escrow system** for the iBetcha betting platform. This is the same mechanism hotels use when they "hold" funds on your card without charging it.

## How It Works

### Pre-Authorization Flow

1. **Each user enters their card**
   - Users create an account and add their payment method (credit card)
   - Payment method is stored securely with Stripe

2. **The app pre-authorizes the wager amount**
   - When creating or joining a bet, the system pre-authorizes (holds) the exact wager amount
   - No money moves. No income. No tax.
   - The funds are simply locked on their card
   - Uses Stripe Payment Intents with `capture_method: 'manual'`

3. **When the winner is declared**
   - **Loser's card is charged**: The pre-authorization is captured, charging their card
   - **Winner receives payout**: The money flows directly from loser to winner via Stripe
   - **You never touch the money**: The platform never holds the pot

## Why This Solves the Problem

✓ **Users cannot back out** — The funds are already reserved on their card  
✓ **You never hold the pot** — No regulatory risk or money transmitter license issues  
✓ **The system feels fair and automatic** — Everything happens automatically via the payment processor  
✓ **Payment processors already support this flow** — This is a standard, proven pattern

## Architecture

### Components

1. **Payment Service** (`src/services/PaymentService.ts`)
   - Handles Stripe integration
   - Pre-authorization (hold) functionality
   - Capture (charge) functionality
   - Release (void) functionality

2. **Bet Service** (`src/services/BetService.ts`)
   - Orchestrates bet lifecycle
   - Coordinates pre-authorizations
   - Processes winner declaration

3. **Data Models** (`src/models/`)
   - User: User accounts with Stripe customer IDs
   - Bet: Bet information and status tracking
   - PaymentAuthorization: Pre-authorization records
   - Transaction: Payment transaction history

4. **API Routes** (`src/routes/`)
   - User management endpoints
   - Bet management endpoints

### Bet Lifecycle

```
┌─────────────┐
│   PENDING   │  Creator creates bet → Pre-authorize creator's card
└──────┬──────┘
       │
       ↓ Opponent joins
┌─────────────┐
│ AUTHORIZED  │  Both cards have funds held (pre-authorized)
└──────┬──────┘
       │
       ↓ Winner declared
┌─────────────┐
│  COMPLETED  │  Loser charged, winner's hold released
└─────────────┘
```

## API Endpoints

### User Management

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Add Payment Method
```http
POST /api/users/:id/payment-methods
Content-Type: application/json

{
  "paymentMethodId": "pm_xxxxxxxxxxxxxx"
}
```

### Bet Management

#### Create Bet (Pre-Authorizes Creator's Card)
```http
POST /api/bets
Content-Type: application/json

{
  "creatorId": "user-id-1",
  "description": "I bet I can run a mile in under 6 minutes",
  "amount": 5000,
  "paymentMethodId": "pm_xxxxxxxxxxxxxx"
}
```
*Note: Amount is in cents (5000 = $50.00)*

#### Join Bet (Pre-Authorizes Opponent's Card)
```http
POST /api/bets/:id/join
Content-Type: application/json

{
  "opponentId": "user-id-2",
  "paymentMethodId": "pm_xxxxxxxxxxxxxx"
}
```

#### Declare Winner (Charges Loser, Pays Winner)
```http
POST /api/bets/:id/declare-winner
Content-Type: application/json

{
  "winnerId": "user-id-1"
}
```

#### Cancel Bet (Releases All Pre-Authorizations)
```http
POST /api/bets/:id/cancel
```

#### Get Bet Details
```http
GET /api/bets/:id
```

#### Get User's Bets
```http
GET /api/users/:userId/bets
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- Stripe account (for payment processing)

### Installation

1. Clone the repository
```bash
git clone https://github.com/tenshinouta1979/iBetcha.git
cd iBetcha
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
cp .env.example .env
```

4. Add your Stripe secret key to `.env`
```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PORT=3000
```

5. Build the project
```bash
npm run build
```

6. Start the server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Testing

You can test the API using curl, Postman, or any HTTP client.

### Example Flow

1. **Create two users**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'

curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@example.com"}'
```

2. **Add payment methods** (using Stripe test payment methods)
```bash
curl -X POST http://localhost:3000/api/users/{userId}/payment-methods \
  -H "Content-Type: application/json" \
  -d '{"paymentMethodId":"pm_card_visa"}'
```

3. **Create a bet**
```bash
curl -X POST http://localhost:3000/api/bets \
  -H "Content-Type: application/json" \
  -d '{
    "creatorId":"alice-user-id",
    "description":"I bet I can beat you at chess",
    "amount":2000,
    "paymentMethodId":"pm_card_visa"
  }'
```

4. **Join the bet**
```bash
curl -X POST http://localhost:3000/api/bets/{betId}/join \
  -H "Content-Type: application/json" \
  -d '{
    "opponentId":"bob-user-id",
    "paymentMethodId":"pm_card_visa"
  }'
```

5. **Declare winner**
```bash
curl -X POST http://localhost:3000/api/bets/{betId}/declare-winner \
  -H "Content-Type: application/json" \
  -d '{"winnerId":"alice-user-id"}'
```

## Security & Compliance

### Legal Safety

- **No money transmission**: The platform never holds user funds
- **No regulatory risk**: Funds go directly from loser to winner via Stripe
- **No income**: Pre-authorizations are not income until captured
- **No tax implications**: Platform facilitates but doesn't process payments

### Security Features

- All payment data handled by Stripe (PCI-DSS compliant)
- No credit card numbers stored in the application
- Pre-authorizations automatically expire if not captured
- Authorization tracking prevents double-charging
- Transaction logging for audit trail

### Best Practices

1. **Use HTTPS in production** - Never use HTTP for payment data
2. **Implement authentication** - Add user authentication before production
3. **Add rate limiting** - Prevent abuse of API endpoints
4. **Monitor Stripe webhooks** - Handle payment failures and disputes
5. **Set authorization expiration** - Stripe authorizations expire after 7 days
6. **Implement dispute resolution** - Add admin panel for handling disputes

## Stripe Test Cards

For testing, use Stripe's test payment methods:

- **Successful charge**: `pm_card_visa`
- **Declined charge**: `pm_card_chargeDeclined`
- **Insufficient funds**: `pm_card_chargeDeclinedInsufficientFunds`

See [Stripe Testing](https://stripe.com/docs/testing) for more test cards.

## Production Considerations

### Before Going Live

1. **Switch to Stripe production keys**
2. **Implement user authentication** (JWT, OAuth, etc.)
3. **Add database persistence** (PostgreSQL, MongoDB, etc.)
4. **Set up proper logging** (Winston, Pino, etc.)
5. **Add monitoring** (Datadog, New Relic, etc.)
6. **Implement Stripe webhooks** for payment events
7. **Add email notifications** for bet status updates
8. **Implement dispute resolution system**
9. **Add KYC/AML compliance** if required by jurisdiction
10. **Set up backup and disaster recovery**

### Scalability

- The current implementation uses in-memory storage
- For production, replace with:
  - **Database**: PostgreSQL, MongoDB, or DynamoDB
  - **Cache**: Redis for session management
  - **Queue**: RabbitMQ or SQS for async processing
  - **CDN**: CloudFront or Fastly for static assets

## License

This project is licensed under the terms specified in the LICENSE file.

## Support

For issues or questions, please open an issue on GitHub.
