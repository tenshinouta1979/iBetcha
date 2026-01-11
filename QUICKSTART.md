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
