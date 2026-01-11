# Mobile App Integration Guide

This guide shows how to integrate the iBetcha Pre-Authorization Escrow API with a mobile application.

## Overview

The iBetcha API is a RESTful backend that handles all betting logic and payment processing. Your mobile app will:

1. Collect user information and card details
2. Make API calls to create users, bets, and process payments
3. Display bet status and transaction history
4. Handle payment method collection via Stripe mobile SDKs

## Architecture

```
┌─────────────────┐
│   Mobile App    │  (iOS/Android/React Native/Flutter)
│                 │
│  UI Layer       │  ← Your responsibility
│  Stripe SDK     │  ← Card collection (secure)
└────────┬────────┘
         │ REST API calls (JSON)
         │
         ↓
┌─────────────────┐
│  iBetcha API    │  (This backend)
│                 │
│  Bet Logic      │  ← Implemented
│  Pre-Auth Logic │  ← Implemented
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│     Stripe      │  (Payment processor)
└─────────────────┘
```

## Setup

### 1. Backend Setup

Deploy the iBetcha API to a server:

```bash
# On your server
git clone https://github.com/tenshinouta1979/iBetcha.git
cd iBetcha
npm install
npm run build

# Set environment variables
export STRIPE_SECRET_KEY=sk_live_your_key
export PORT=3000

# Start server
npm start
```

Or use a cloud platform like Heroku, AWS, Google Cloud, etc.

### 2. Mobile App Setup

Install dependencies in your mobile app:

#### React Native
```bash
npm install @stripe/stripe-react-native
```

#### iOS (Swift)
```ruby
# Podfile
pod 'Stripe'
```

#### Android (Kotlin)
```gradle
// build.gradle
implementation 'com.stripe:stripe-android:20.x.x'
```

#### Flutter
```yaml
# pubspec.yaml
dependencies:
  stripe_platform_interface: ^9.0.0
```

## Integration Flow

### Step 1: Initialize Stripe in Your App

Get your **publishable key** from Stripe dashboard (starts with `pk_test_` or `pk_live_`).

#### React Native
```javascript
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider publishableKey="pk_test_your_key">
      {/* Your app components */}
    </StripeProvider>
  );
}
```

#### iOS
```swift
import Stripe

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, 
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        StripeAPI.defaultPublishableKey = "pk_test_your_key"
        return true
    }
}
```

#### Android
```kotlin
import com.stripe.android.PaymentConfiguration

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        PaymentConfiguration.init(
            applicationContext,
            "pk_test_your_key"
        )
    }
}
```

### Step 2: Create User Account

When a user signs up, create their account in iBetcha:

```javascript
async function createUser(name, email) {
  const response = await fetch('https://your-api.com/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  });
  
  const user = await response.json();
  // Save user.id locally for future API calls
  return user;
}
```

### Step 3: Collect Payment Method

Use Stripe's mobile SDK to securely collect card information:

#### React Native
```javascript
import { CardField, useStripe } from '@stripe/stripe-react-native';

function AddCardScreen() {
  const { createPaymentMethod } = useStripe();

  async function handleAddCard() {
    // Create payment method from card details
    const { paymentMethod, error } = await createPaymentMethod({
      paymentMethodType: 'Card',
      // Card details collected via CardField component
    });

    if (error) {
      console.error(error);
      return;
    }

    // Send payment method ID to your backend
    await addPaymentMethodToUser(userId, paymentMethod.id);
  }

  return <CardField onCardChange={() => {}} />;
}
```

#### iOS
```swift
import Stripe

func addCard() {
    let cardParams = STPCardParams()
    cardParams.number = "4242424242424242"
    cardParams.expMonth = 12
    cardParams.expYear = 2025
    cardParams.cvc = "123"

    let paymentMethodParams = STPPaymentMethodParams(card: cardParams, 
                                                      billingDetails: nil, 
                                                      metadata: nil)

    STPAPIClient.shared.createPaymentMethod(with: paymentMethodParams) { paymentMethod, error in
        guard let paymentMethod = paymentMethod else {
            print(error ?? "Unknown error")
            return
        }
        
        // Send paymentMethod.stripeId to your backend
        self.addPaymentMethodToUser(userId: userId, 
                                    paymentMethodId: paymentMethod.stripeId)
    }
}
```

#### Android
```kotlin
import com.stripe.android.Stripe
import com.stripe.android.model.CardParams

fun addCard() {
    val cardParams = CardParams(
        number = "4242424242424242",
        expMonth = 12,
        expYear = 2025,
        cvc = "123"
    )

    val stripe = Stripe(context, "pk_test_your_key")
    stripe.createPaymentMethod(
        PaymentMethodCreateParams.create(cardParams)
    ) { result ->
        result.fold(
            onSuccess = { paymentMethod ->
                // Send paymentMethod.id to your backend
                addPaymentMethodToUser(userId, paymentMethod.id)
            },
            onFailure = { error ->
                println(error.message)
            }
        )
    }
}
```

### Step 4: Send Payment Method to Backend

```javascript
async function addPaymentMethodToUser(userId, paymentMethodId) {
  const response = await fetch(
    `https://your-api.com/api/users/${userId}/payment-methods`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId })
    }
  );
  
  return await response.json();
}
```

### Step 5: Create a Bet

```javascript
async function createBet(creatorId, description, amount, paymentMethodId) {
  const response = await fetch('https://your-api.com/api/bets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creatorId,
      description,
      amount: amount * 100, // Convert dollars to cents
      paymentMethodId
    })
  });
  
  const result = await response.json();
  
  if (response.ok) {
    alert('Bet created! Funds have been pre-authorized on your card.');
    return result.bet;
  } else {
    alert('Failed to create bet: ' + result.error);
  }
}
```

### Step 6: Join a Bet

```javascript
async function joinBet(betId, opponentId, paymentMethodId) {
  const response = await fetch(
    `https://your-api.com/api/bets/${betId}/join`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opponentId, paymentMethodId })
    }
  );
  
  const result = await response.json();
  
  if (response.ok) {
    alert('Bet joined! Funds have been pre-authorized on your card.');
    return result.bet;
  } else {
    alert('Failed to join bet: ' + result.error);
  }
}
```

### Step 7: Declare Winner

```javascript
async function declareWinner(betId, winnerId) {
  const response = await fetch(
    `https://your-api.com/api/bets/${betId}/declare-winner`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerId })
    }
  );
  
  const result = await response.json();
  
  if (response.ok) {
    alert('Winner declared! Payment has been processed.');
    return result.bet;
  } else {
    alert('Failed to declare winner: ' + result.error);
  }
}
```

### Step 8: View Bet History

```javascript
async function getUserBets(userId) {
  const response = await fetch(
    `https://your-api.com/api/users/${userId}/bets`
  );
  
  const bets = await response.json();
  return bets;
}
```

## UI Recommendations

### Bet Creation Screen
- Input: Bet description (text area)
- Input: Bet amount (number, show in dollars)
- Button: "Create Bet" (triggers pre-authorization)
- Note: Show message "Your card will be pre-authorized for $X.XX"

### Bet List Screen
- Show all bets with status badges:
  - 🟡 PENDING - Waiting for opponent
  - 🟢 AUTHORIZED - Ready to resolve
  - ✅ COMPLETED - Winner declared
  - ❌ CANCELLED - Bet cancelled
- Tap to view details

### Bet Details Screen
- Show: Description, amount, creator, opponent, status
- Show: Pre-authorization status for both users
- Button: "Join Bet" (if pending and user is not creator)
- Button: "Declare Winner" (if authorized)
- Button: "Cancel Bet" (if pending or authorized)

### Transaction History Screen
- List all transactions for user
- Show: Bet description, amount, date, type (won/lost)
- Show total winnings/losses

## Example React Native Component

```javascript
import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';

function CreateBetScreen({ userId }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const { createPaymentMethod } = useStripe();

  async function handleCreateBet() {
    // Create payment method from card
    const { paymentMethod, error } = await createPaymentMethod({
      paymentMethodType: 'Card',
    });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    // Create bet with pre-authorization
    try {
      const response = await fetch('https://your-api.com/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: userId,
          description,
          amount: parseFloat(amount) * 100, // Convert to cents
          paymentMethodId: paymentMethod.id
        })
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success!',
          `Bet created! $${amount} has been pre-authorized on your card.`
        );
        // Navigate to bet details screen
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create bet');
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Create a Bet</Text>
      
      <TextInput
        placeholder="Bet description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      
      <TextInput
        placeholder="Amount ($)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />
      
      <CardField
        postalCodeEnabled={false}
        onCardChange={() => {}}
        style={{ height: 50, marginVertical: 20 }}
      />
      
      <Button title="Create Bet" onPress={handleCreateBet} />
      
      <Text style={{ marginTop: 10, color: '#666' }}>
        Your card will be pre-authorized for ${amount || '0.00'}
      </Text>
    </View>
  );
}
```

## Error Handling

Always handle errors appropriately:

```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    // API returned an error
    switch (response.status) {
      case 400:
        alert('Invalid request: ' + data.error);
        break;
      case 404:
        alert('Not found: ' + data.error);
        break;
      case 500:
        alert('Server error. Please try again later.');
        break;
      default:
        alert('Error: ' + data.error);
    }
    return;
  }
  
  // Success
  return data;
} catch (error) {
  // Network error
  alert('Network error. Please check your connection.');
}
```

## Security Best Practices

1. **Never store card numbers** - Always use Stripe's mobile SDKs
2. **Use HTTPS** - All API calls must be over HTTPS in production
3. **Implement authentication** - Add user authentication (JWT, OAuth)
4. **Validate on backend** - Never trust client-side input alone
5. **Use test mode** - Use test keys during development
6. **PCI compliance** - Stripe handles this, but never log card data

## Testing

### Test Mode
- Use Stripe test keys: `pk_test_...` and `sk_test_...`
- Use test cards: `4242 4242 4242 4242` (Visa)
- No real charges are made in test mode

### Test Flow
1. Create two test users
2. Add payment methods to both
3. User A creates a bet
4. User B joins the bet
5. Declare winner
6. Check transaction history

## Production Checklist

Before going live:
- [ ] Switch to Stripe production keys
- [ ] Enable HTTPS on your backend
- [ ] Implement user authentication
- [ ] Add rate limiting
- [ ] Set up monitoring and logging
- [ ] Test error scenarios
- [ ] Add email notifications
- [ ] Implement dispute resolution
- [ ] Add terms of service
- [ ] Add privacy policy
- [ ] Test with real (small) transactions

## Support

For questions or issues:
- Backend API: See [API.md](./API.md)
- Stripe Mobile SDKs: https://stripe.com/docs/mobile
- React Native: https://github.com/stripe/stripe-react-native
- iOS: https://stripe.com/docs/mobile/ios
- Android: https://stripe.com/docs/mobile/android

## Additional Resources

- Stripe Documentation: https://stripe.com/docs
- Payment Intents: https://stripe.com/docs/payments/payment-intents
- Mobile SDK Examples: https://github.com/stripe/stripe-mobile-examples
- Pre-authorization: https://stripe.com/docs/payments/capture-later
