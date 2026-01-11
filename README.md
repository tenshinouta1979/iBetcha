# iBetcha

A simple mobile betting platform that helps users create quick challenges with clear conditions and agreed stakes. Once both sides commit, the app tracks the terms, holds the wager amount, and awards the full pot to the verified winner.

## Features

- **Create Challenges**: Set up quick challenges with clear conditions and stakes
- **Two-Party Agreement**: Both parties must agree to the terms before proceeding
- **Wager Locking**: Secure wager mechanism that holds stakes from both parties
- **Outcome Verification**: Simple verification system to determine the winner
- **Fair Payouts**: Winner takes the full pot once outcome is verified
- **User-Friendly Interface**: Clean and intuitive mobile UI

## How It Works

1. **Create a Challenge**: User creates a challenge with:
   - Description (e.g., "Basketball 1v1")
   - Winning condition (e.g., "First to 21 points")
   - Stake amount (e.g., $50)
   - Opponent selection

2. **Accept Challenge**: The opponent reviews and accepts the challenge terms

3. **Lock Wagers**: Both parties' stakes are locked into the pot
   - Total pot = Stake × 2

4. **Complete Challenge**: After the challenge is completed in real life

5. **Verify Outcome**: Participants verify who won

6. **Winner Takes All**: The full pot is awarded to the winner

## Technology Stack

- **React Native**: Cross-platform mobile development
- **React Navigation**: Screen navigation and routing
- **JavaScript ES6+**: Modern JavaScript features

## Project Structure

```
iBetcha/
├── src/
│   ├── models/          # Data models (Challenge, User)
│   ├── services/        # Business logic (ChallengeService)
│   ├── screens/         # Screen components
│   │   ├── HomeScreen.js
│   │   ├── CreateChallengeScreen.js
│   │   └── ChallengeDetailScreen.js
│   ├── navigation/      # Navigation configuration
│   └── App.js          # Root component
├── index.js            # App entry point
└── package.json        # Dependencies and scripts
```

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- React Native development environment set up
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and Android SDK

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/tenshinouta1979/iBetcha.git
   cd iBetcha
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **For iOS (Mac only)**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Run the app**
   
   For iOS:
   ```bash
   npm run ios
   ```
   
   For Android:
   ```bash
   npm run android
   ```

## Available Scripts

- `npm start` - Start the Metro bundler
- `npm run ios` - Run the app on iOS simulator
- `npm run android` - Run the app on Android emulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Core Components

### Challenge Model
Represents a betting challenge with properties:
- Creator and opponent information
- Description and winning condition
- Stake amount and total pot
- Status (pending, accepted, locked, completed, cancelled)

### ChallengeService
Manages all challenge operations:
- Creating new challenges
- Accepting challenges
- Locking wagers
- Verifying outcomes
- Managing user balances

### Screens

1. **HomeScreen**: Displays all challenges and user balance
2. **CreateChallengeScreen**: Form to create a new challenge
3. **ChallengeDetailScreen**: Detailed view with action buttons based on challenge status

## Challenge Lifecycle

```
PENDING → ACCEPTED → LOCKED → COMPLETED
   ↓
CANCELLED
```

- **PENDING**: Challenge created, waiting for opponent to accept
- **ACCEPTED**: Opponent accepted, ready to lock wagers
- **LOCKED**: Wagers locked, challenge in progress
- **COMPLETED**: Winner determined, pot awarded
- **CANCELLED**: Challenge cancelled before being accepted

## Future Enhancements

- Backend API integration for persistent storage
- User authentication and profiles
- Push notifications for challenge updates
- Chat feature between participants
- Dispute resolution system
- Challenge history and statistics
- Social features (friends, leaderboards)
- Multiple payment methods
- Photo/video evidence upload for verification

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See LICENSE file for details.
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
