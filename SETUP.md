# Setup Guide for iBetcha

This guide will help you set up and run the iBetcha mobile betting application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **React Native CLI** - Install with: `npm install -g react-native-cli`

### For iOS Development (Mac only)
- **Xcode** (latest version from App Store)
- **CocoaPods** - Install with: `sudo gem install cocoapods`

### For Android Development
- **Android Studio** - [Download here](https://developer.android.com/studio)
- **Android SDK** (API level 28 or higher)
- **Java Development Kit (JDK 11)**

## Step-by-Step Installation

### 1. Clone the Repository
```bash
git clone https://github.com/tenshinouta1979/iBetcha.git
cd iBetcha
```

### 2. Install Node Dependencies
```bash
npm install
```

This will install all required packages including:
- React and React Native
- React Navigation libraries
- UUID for ID generation
- Development tools (ESLint, Jest, Babel)

### 3. iOS Setup (Mac only)

Install iOS dependencies:
```bash
cd ios
pod install
cd ..
```

### 4. Android Setup

1. Open Android Studio
2. Configure Android SDK (if not already done)
3. Create an Android Virtual Device (AVD) or connect a physical device

## Running the Application

### Start Metro Bundler
In the project root, start the Metro bundler:
```bash
npm start
```

### Run on iOS (Mac only)
In a new terminal window:
```bash
npm run ios
```

Or specify a device:
```bash
npm run ios -- --simulator="iPhone 14 Pro"
```

### Run on Android
In a new terminal window:
```bash
npm run android
```

Make sure you have an Android emulator running or a device connected.

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## Linting

Check code style:
```bash
npm run lint
```

## Troubleshooting

### Common Issues

#### Metro bundler issues
If you encounter issues with the bundler, try:
```bash
npm start -- --reset-cache
```

#### iOS build issues
1. Clean the build:
   ```bash
   cd ios
   xcodebuild clean
   cd ..
   ```
2. Reinstall pods:
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

#### Android build issues
1. Clean the build:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```
2. Check that your Android SDK is properly configured

#### Module not found errors
Try removing and reinstalling dependencies:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

## Project Structure Overview

```
iBetcha/
├── __tests__/              # Test files
│   ├── Challenge.test.js
│   ├── User.test.js
│   └── ChallengeService.test.js
├── src/
│   ├── models/             # Data models
│   │   ├── Challenge.js
│   │   └── User.js
│   ├── services/           # Business logic
│   │   └── ChallengeService.js
│   ├── screens/            # UI screens
│   │   ├── HomeScreen.js
│   │   ├── CreateChallengeScreen.js
│   │   └── ChallengeDetailScreen.js
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.js
│   └── App.js             # Root component
├── index.js               # Entry point
├── package.json           # Dependencies
├── babel.config.js        # Babel configuration
└── .eslintrc.js          # ESLint configuration
```

## Using the App

### 1. View Challenges
- The home screen shows all challenges
- Your current balance is displayed at the top
- Challenges are color-coded by status

### 2. Create a Challenge
- Tap "Create Challenge" button
- Fill in the challenge description
- Enter the winning condition
- Select an opponent
- Set the stake amount
- Tap "Create Challenge"

### 3. Accept a Challenge
- Tap on a pending challenge
- Review the details
- Tap "Accept Challenge" if you're the opponent

### 4. Lock Wagers
- After acceptance, tap "Lock Wagers"
- This deducts the stake from both parties

### 5. Complete Challenge
- After completing the real-world challenge
- Tap on the challenge and select "Verify Outcome"
- Choose the winner
- The full pot is awarded to the winner

## Challenge Status Flow

1. **PENDING** (Orange) - Challenge created, waiting for acceptance
2. **ACCEPTED** (Green) - Opponent accepted, ready to lock wagers
3. **LOCKED** (Blue) - Wagers locked, challenge in progress
4. **COMPLETED** (Gray) - Challenge finished, winner determined
5. **CANCELLED** (Red) - Challenge cancelled before acceptance

## Next Steps

- Customize the app styling in the screen files
- Add more user profiles in `ChallengeService.js`
- Implement backend integration for persistence
- Add authentication for real user accounts

## Support

For issues or questions, please open an issue on the GitHub repository.
