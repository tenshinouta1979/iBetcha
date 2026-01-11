# iBetcha API Documentation

## Pre-Authorization Escrow System

The iBetcha API implements a credit card pre-authorization escrow system that ensures fair and secure betting without the platform ever holding user funds.

## Base URL

```
http://localhost:3000
```

## Key Concepts

### Pre-Authorization (Hold)
When a user creates or joins a bet, their card is pre-authorized for the bet amount. This means:
- Funds are reserved on their card
- No actual charge is made
- The authorization can be captured (charged) or released (voided) later
- Authorizations typically expire after 7 days if not captured

### Payment Flow
1. **Creator creates bet** → Pre-authorization on creator's card
2. **Opponent joins bet** → Pre-authorization on opponent's card  
3. **Winner declared** → Loser's authorization is captured (charged), winner's is released
4. **Money flows** from loser directly to winner via Stripe (platform never touches it)

## Authentication

Currently, the API does not implement authentication. For production use, implement:
- JWT tokens
- OAuth 2.0
- API keys

## Endpoints

---

### Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-11T22:00:00.000Z"
}
```

---

### Create User

Create a new user and associated Stripe customer.

**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "stripeCustomerId": "cus_xxxxxxxxxxxxx",
  "createdAt": "2026-01-11T22:00:00.000Z"
}
```

**Errors:**
- `400 Bad Request`: Missing name or email
- `500 Internal Server Error`: Failed to create Stripe customer

---

### Get User

Retrieve user details by ID.

**Endpoint:** `GET /api/users/:id`

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "stripeCustomerId": "cus_xxxxxxxxxxxxx",
  "paymentMethodId": "pm_xxxxxxxxxxxxx",
  "createdAt": "2026-01-11T22:00:00.000Z"
}
```

**Errors:**
- `404 Not Found`: User does not exist

---

### Get All Users

Retrieve all users.

**Endpoint:** `GET /api/users`

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "stripeCustomerId": "cus_xxxxxxxxxxxxx",
    "createdAt": "2026-01-11T22:00:00.000Z"
  }
]
```

---

### Add Payment Method

Attach a payment method to a user's Stripe customer.

**Endpoint:** `POST /api/users/:id/payment-methods`

**Request Body:**
```json
{
  "paymentMethodId": "pm_xxxxxxxxxxxxx"
}
```

**Note:** To get a payment method ID, you need to:
1. Use Stripe.js or Stripe mobile SDKs to collect card info securely
2. Create a PaymentMethod on the client side
3. Send the PaymentMethod ID to your backend

For testing, use Stripe test payment methods like `pm_card_visa`.

**Response:** `200 OK`
```json
{
  "message": "Payment method added successfully",
  "paymentMethod": {
    "id": "pm_xxxxxxxxxxxxx",
    "brand": "visa",
    "last4": "4242"
  }
}
```

**Errors:**
- `400 Bad Request`: Missing payment method ID
- `404 Not Found`: User does not exist
- `500 Internal Server Error`: Failed to attach payment method

---

### Create Bet

Create a new bet with pre-authorization on creator's card.

**Endpoint:** `POST /api/bets`

**Request Body:**
```json
{
  "creatorId": "550e8400-e29b-41d4-a716-446655440000",
  "description": "I bet I can run a mile in under 6 minutes",
  "amount": 5000,
  "paymentMethodId": "pm_xxxxxxxxxxxxx"
}
```

**Fields:**
- `creatorId`: User ID of the bet creator
- `description`: Description of the bet terms
- `amount`: Bet amount in cents (5000 = $50.00)
- `paymentMethodId`: Payment method ID to pre-authorize

**Response:** `201 Created`
```json
{
  "message": "Bet created successfully. Funds have been pre-authorized on your card.",
  "bet": {
    "id": "bet-uuid",
    "creatorId": "550e8400-e29b-41d4-a716-446655440000",
    "description": "I bet I can run a mile in under 6 minutes",
    "amount": 5000,
    "status": "PENDING",
    "creatorAuthorizationId": "auth-uuid",
    "createdAt": "2026-01-11T22:00:00.000Z",
    "expiresAt": "2026-01-18T22:00:00.000Z"
  }
}
```

**Status:** `PENDING` - Waiting for opponent to join

**Errors:**
- `400 Bad Request`: Missing required fields or invalid amount
- `404 Not Found`: Creator not found
- `500 Internal Server Error`: Pre-authorization failed

---

### Join Bet

Join an existing bet with pre-authorization on opponent's card.

**Endpoint:** `POST /api/bets/:id/join`

**Request Body:**
```json
{
  "opponentId": "660e8400-e29b-41d4-a716-446655440001",
  "paymentMethodId": "pm_xxxxxxxxxxxxx"
}
```

**Response:** `200 OK`
```json
{
  "message": "Bet joined successfully. Funds have been pre-authorized on your card.",
  "bet": {
    "id": "bet-uuid",
    "creatorId": "550e8400-e29b-41d4-a716-446655440000",
    "opponentId": "660e8400-e29b-41d4-a716-446655440001",
    "description": "I bet I can run a mile in under 6 minutes",
    "amount": 5000,
    "status": "AUTHORIZED",
    "creatorAuthorizationId": "auth-uuid-1",
    "opponentAuthorizationId": "auth-uuid-2",
    "createdAt": "2026-01-11T22:00:00.000Z"
  }
}
```

**Status:** `AUTHORIZED` - Both parties have pre-authorized funds

**Errors:**
- `400 Bad Request`: Missing fields or trying to join own bet
- `404 Not Found`: Bet or opponent not found
- `500 Internal Server Error`: Pre-authorization failed

---

### Declare Winner

Declare the winner of a bet, charge the loser, and release winner's hold.

**Endpoint:** `POST /api/bets/:id/declare-winner`

**Request Body:**
```json
{
  "winnerId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:** `200 OK`
```json
{
  "message": "Winner declared. Loser has been charged and winner's hold has been released.",
  "bet": {
    "id": "bet-uuid",
    "creatorId": "550e8400-e29b-41d4-a716-446655440000",
    "opponentId": "660e8400-e29b-41d4-a716-446655440001",
    "description": "I bet I can run a mile in under 6 minutes",
    "amount": 5000,
    "status": "COMPLETED",
    "winnerId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-01-11T22:00:00.000Z",
    "completedAt": "2026-01-11T23:00:00.000Z"
  }
}
```

**Status:** `COMPLETED` - Payment processed, bet finished

**What Happens:**
1. Loser's pre-authorization is captured (card is charged)
2. Winner's pre-authorization is released (no charge)
3. Money flows from loser to winner via Stripe
4. Transaction is recorded

**Errors:**
- `400 Bad Request`: Missing winner ID or invalid winner
- `404 Not Found`: Bet not found
- `500 Internal Server Error`: Payment processing failed

---

### Cancel Bet

Cancel a bet and release all pre-authorizations.

**Endpoint:** `POST /api/bets/:id/cancel`

**Response:** `200 OK`
```json
{
  "message": "Bet cancelled. All pre-authorizations have been released.",
  "bet": {
    "id": "bet-uuid",
    "status": "CANCELLED",
    "createdAt": "2026-01-11T22:00:00.000Z"
  }
}
```

**Status:** `CANCELLED` - Bet cancelled, all holds released

**Errors:**
- `404 Not Found`: Bet not found
- `500 Internal Server Error`: Failed to release authorizations

---

### Get Bet

Retrieve bet details by ID.

**Endpoint:** `GET /api/bets/:id`

**Response:** `200 OK`
```json
{
  "id": "bet-uuid",
  "creatorId": "550e8400-e29b-41d4-a716-446655440000",
  "opponentId": "660e8400-e29b-41d4-a716-446655440001",
  "description": "I bet I can run a mile in under 6 minutes",
  "amount": 5000,
  "status": "AUTHORIZED",
  "creatorAuthorizationId": "auth-uuid-1",
  "opponentAuthorizationId": "auth-uuid-2",
  "createdAt": "2026-01-11T22:00:00.000Z"
}
```

**Errors:**
- `404 Not Found`: Bet does not exist

---

### Get User's Bets

Retrieve all bets for a specific user.

**Endpoint:** `GET /api/users/:userId/bets`

**Response:** `200 OK`
```json
[
  {
    "id": "bet-uuid",
    "creatorId": "550e8400-e29b-41d4-a716-446655440000",
    "description": "I bet I can run a mile in under 6 minutes",
    "amount": 5000,
    "status": "COMPLETED",
    "createdAt": "2026-01-11T22:00:00.000Z"
  }
]
```

---

### Get All Bets

Retrieve all bets in the system.

**Endpoint:** `GET /api/bets`

**Response:** `200 OK`
```json
[
  {
    "id": "bet-uuid",
    "creatorId": "550e8400-e29b-41d4-a716-446655440000",
    "description": "I bet I can run a mile in under 6 minutes",
    "amount": 5000,
    "status": "AUTHORIZED",
    "createdAt": "2026-01-11T22:00:00.000Z"
  }
]
```

---

### Get Bet Transactions

Retrieve payment transactions for a bet.

**Endpoint:** `GET /api/bets/:id/transactions`

**Response:** `200 OK`
```json
[
  {
    "id": "tx-uuid",
    "betId": "bet-uuid",
    "fromUserId": "660e8400-e29b-41d4-a716-446655440001",
    "toUserId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 5000,
    "type": "CHARGE",
    "createdAt": "2026-01-11T23:00:00.000Z"
  }
]
```

---

## Bet Status Flow

```
PENDING     → Bet created, waiting for opponent
    ↓
AUTHORIZED  → Both parties joined, funds held
    ↓
COMPLETED   → Winner declared, payment processed
```

Or:

```
PENDING/AUTHORIZED → CANCELLED (bet cancelled, holds released)
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Testing with Stripe

For testing, use Stripe's test mode and test payment methods:

**Test Cards (use as payment method IDs):**
- `pm_card_visa`: Successful charge
- `pm_card_chargeDeclined`: Declined charge
- `pm_card_chargeDeclinedInsufficientFunds`: Insufficient funds

See [Stripe Testing Docs](https://stripe.com/docs/testing) for more options.

---

## Rate Limiting

Currently not implemented. For production, add rate limiting to prevent abuse.

---

## Webhooks

To handle asynchronous events from Stripe (payment failures, disputes, etc.), implement webhook handlers for:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`

---

## Best Practices

1. **Always use HTTPS in production**
2. **Implement proper authentication**
3. **Validate all inputs**
4. **Handle errors gracefully**
5. **Log all transactions**
6. **Monitor Stripe events**
7. **Set up alerting for failures**
