# Quick Start Guide

Get up and running with iBetcha in 5 minutes!

## Prerequisites

- Node.js v14+ installed
- React Native development environment set up
- iOS Simulator (Mac) or Android Emulator

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/tenshinouta1979/iBetcha.git
cd iBetcha

# 2. Install dependencies
npm install

# 3. For iOS (Mac only), install pods
cd ios && pod install && cd ..

# 4. Start Metro bundler
npm start

# 5. In a new terminal, run the app
npm run ios    # for iOS
# OR
npm run android  # for Android
```

## Your First Challenge

1. **App opens to Home Screen**
   - You'll see "Balance: $1000" at the top
   - No challenges yet

2. **Create a Challenge**
   - Tap "Create Challenge"
   - Description: "Basketball 1v1"
   - Condition: "First to 21 points"
   - Select opponent: "Alice"
   - Stake: "50"
   - Tap "Create Challenge"

3. **View Your Challenge**
   - See orange "PENDING" badge
   - Shows "You vs Alice"
   - Shows "Stake: $50 | Pot: $100"

4. **Simulate Opponent Accepting** (for demo)
   - Tap the challenge to view details
   - The opponent (Alice) would see "Accept Challenge" button
   - After acceptance, status becomes green "ACCEPTED"

5. **Lock Wagers**
   - Tap "Lock Wagers"
   - Confirm in dialog
   - Status becomes blue "LOCKED"
   - Your balance updates to $950 (deducted $50)

6. **Complete Challenge**
   - Tap "You Won" or "Alice Won"
   - Confirm winner
   - Winner receives $100
   - Status becomes gray "COMPLETED"

## Challenge Status Colors

- 🟠 **Orange**: PENDING - Waiting for opponent
- 🟢 **Green**: ACCEPTED - Ready to lock wagers
- 🔵 **Blue**: LOCKED - Challenge in progress
- ⚪ **Gray**: COMPLETED - Winner determined
- 🔴 **Red**: CANCELLED - Challenge cancelled

## Testing

```bash
# Run unit tests
npm test

# Run with watch mode
npm test -- --watch
```

## Troubleshooting

**Metro bundler won't start**
```bash
npm start -- --reset-cache
```

**iOS build fails**
```bash
cd ios
pod deintegrate && pod install
cd ..
```

**Android build fails**
```bash
cd android
./gradlew clean
cd ..
```

## Project Structure

```
iBetcha/
├── src/
│   ├── models/          # Data models
│   ├── services/        # Business logic
│   ├── screens/         # UI screens
│   └── navigation/      # Navigation setup
├── __tests__/           # Unit tests
└── [documentation]      # README, SETUP, etc.
```

## Key Features

✅ Create challenges with stakes
✅ Accept/decline challenges
✅ Lock wagers from both parties
✅ Verify outcomes
✅ Award full pot to winner
✅ Track balance in real-time

## Next Steps

- Read [README.md](README.md) for full feature list
- Check [SETUP.md](SETUP.md) for detailed installation
- Review [ARCHITECTURE.md](ARCHITECTURE.md) to understand the code
- See [USER_FLOW.md](USER_FLOW.md) for complete user journeys

## Need Help?

- Open an issue on GitHub
- Check troubleshooting in SETUP.md
- Review architecture documentation

## Demo Users Available

- **You** (user1) - The logged-in user
- **Alice** (user2) - Available opponent
- **Bob** (user3) - Available opponent
- **Charlie** (user4) - Available opponent

All users start with $1000 balance.

Enjoy betting with friends! 🎉
Get the iBetcha Pre-Authorization Escrow API running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm installed
- Stripe account (free test mode)

## Setup

### 1. Clone and Install (1 minute)

```bash
git clone https://github.com/tenshinouta1979/iBetcha.git
cd iBetcha
npm install
```

### 2. Configure Stripe (1 minute)

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your "Secret key" (starts with `sk_test_`)
3. Create `.env` file:

```bash
echo "STRIPE_SECRET_KEY=sk_test_your_key_here" > .env
echo "PORT=3000" >> .env
```

### 3. Build and Start (1 minute)

```bash
npm run build
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║  iBetcha Pre-Authorization Escrow API                     ║
║  Server running on port 3000                              ║
╚═══════════════════════════════════════════════════════════╝
```

### 4. Test It (2 minutes)

Open a new terminal and test the API:

```bash
# Test health check
curl http://localhost:3000/health

# Expected output: {"status":"ok","timestamp":"..."}
```

## What You Get

✅ **Complete Pre-Authorization System**
- Users can create bets with card pre-authorization
- Opponents join bets with their card pre-authorized
- Winner declaration automatically charges loser and pays winner
- Platform never holds user funds (no regulatory risk!)

✅ **RESTful API**
- User management endpoints
- Bet creation and management
- Payment processing
- Transaction history

✅ **Stripe Integration**
- Credit card pre-authorization (holds)
- Automatic capture (charging)
- Automatic release (voiding holds)
- Direct user-to-user payments

✅ **Complete Documentation**
- API reference ([API.md](./API.md))
- Implementation guide ([IMPLEMENTATION.md](./IMPLEMENTATION.md))
- Mobile integration guide ([MOBILE_INTEGRATION.md](./MOBILE_INTEGRATION.md))
- Flow diagrams ([FLOW_DIAGRAM.md](./FLOW_DIAGRAM.md))

## Next Steps

### Try the Demo

```bash
# In a new terminal (keep server running)
node demo.js
```

This runs through a complete bet lifecycle:
1. Creates two users (Alice and Bob)
2. Adds payment methods
3. Alice creates a bet ($50)
4. Bob joins the bet
5. Alice wins
6. Bob's card is charged, Alice's hold is released

### Read the Documentation

- **[API.md](./API.md)** - Complete API reference with examples
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Architecture and implementation details
- **[MOBILE_INTEGRATION.md](./MOBILE_INTEGRATION.md)** - How to integrate with mobile apps
- **[FLOW_DIAGRAM.md](./FLOW_DIAGRAM.md)** - Visual flow diagrams

### Test with Postman/curl

See [API.md](./API.md) for detailed examples of all endpoints.

### Integrate with Your App

See [MOBILE_INTEGRATION.md](./MOBILE_INTEGRATION.md) for React Native, iOS, Android, and Flutter examples.

## How It Works

### Pre-Authorization Flow

1. **User creates bet** → Their card is pre-authorized (held, not charged)
2. **Opponent joins** → Their card is pre-authorized too
3. **Winner declared** → Loser's pre-authorization is captured (charged), winner's is released
4. **Money flows** from loser to winner via Stripe - platform never touches it!

This is the **same mechanism hotels use** when they hold $200 on your card for incidentals.

## Key Benefits

✅ **No Regulatory Risk** - Platform never holds funds  
✅ **Users Can't Back Out** - Funds are already reserved  
✅ **Fair & Automatic** - Payment processor handles everything  
✅ **Industry Standard** - Proven, scalable approach  
✅ **Legally Safe** - No money transmission, no income, no tax issues  

## Troubleshooting

### Server won't start
- Check that port 3000 is not already in use
- Verify `.env` file exists with valid Stripe key
- Run `npm install` again

### Demo fails
- Make sure server is running first
- Verify your Stripe test key is correct (starts with `sk_test_`)
- Check that you're using test mode, not production

### API errors
- Check server logs for detailed error messages
- Verify JSON payload is correct
- Make sure all required fields are provided

## Development Mode

For development with auto-reload:

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

## Production Deployment

Before deploying to production:

1. Switch to Stripe production keys (starts with `sk_live_`)
2. Enable HTTPS
3. Add user authentication
4. Replace in-memory storage with database
5. Set up monitoring and logging
6. Implement rate limiting
7. Add email notifications

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for complete production checklist.

## Support

- 📖 Read [API.md](./API.md) for API documentation
- 🏗️ Read [IMPLEMENTATION.md](./IMPLEMENTATION.md) for architecture details
- 📱 Read [MOBILE_INTEGRATION.md](./MOBILE_INTEGRATION.md) for mobile integration
- 🔍 See [FLOW_DIAGRAM.md](./FLOW_DIAGRAM.md) for visual flow diagrams
- 🐛 Open an issue on GitHub

## What's Included

```
iBetcha/
├── src/                  # TypeScript source code
│   ├── index.ts         # Express app entry point
│   ├── types/           # Type definitions
│   ├── models/          # Data stores
│   ├── services/        # Business logic
│   └── routes/          # API endpoints
├── dist/                # Compiled JavaScript (after build)
├── demo.js              # Demo script
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── .env.example         # Environment template
├── README.md            # Overview
├── API.md               # API documentation
├── IMPLEMENTATION.md    # Implementation guide
├── MOBILE_INTEGRATION.md # Mobile integration guide
├── FLOW_DIAGRAM.md      # Flow diagrams
├── SUMMARY.md           # Implementation summary
└── QUICKSTART.md        # This file
```

## License

See [LICENSE](./LICENSE) file for details.
