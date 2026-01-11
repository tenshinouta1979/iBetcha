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
