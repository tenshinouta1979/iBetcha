#!/usr/bin/env node

/**
 * Demo script to test the iBetcha Pre-Authorization Escrow API
 * This demonstrates the complete flow of the betting system
 * 
 * NOTE: This is a test script and should not be run in production.
 * It requires the server to be running and a valid Stripe test key.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function makeRequest(method, path, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Request failed: ${JSON.stringify(data)}`);
  }
  
  return data;
}

async function runDemo() {
  try {
    section('🎯 iBetcha Pre-Authorization Escrow Demo');
    log('This demo shows the complete betting flow with credit card pre-authorization', 'blue');

    // Step 1: Check health
    section('1. Health Check');
    const health = await makeRequest('GET', '/health');
    log(`✓ API Status: ${health.status}`, 'green');

    // Step 2: Create users
    section('2. Creating Users');
    log('Creating Alice...', 'blue');
    const alice = await makeRequest('POST', '/api/users', {
      name: 'Alice',
      email: 'alice@example.com'
    });
    log(`✓ Alice created with ID: ${alice.id}`, 'green');
    log(`  Stripe Customer ID: ${alice.stripeCustomerId}`, 'yellow');

    log('\nCreating Bob...', 'blue');
    const bob = await makeRequest('POST', '/api/users', {
      name: 'Bob',
      email: 'bob@example.com'
    });
    log(`✓ Bob created with ID: ${bob.id}`, 'green');
    log(`  Stripe Customer ID: ${bob.stripeCustomerId}`, 'yellow');

    // Step 3: Add payment methods
    section('3. Adding Payment Methods');
    log('Note: In production, payment methods would be created client-side with Stripe.js', 'yellow');
    log('For this demo, we\'ll use Stripe test payment method IDs', 'yellow');

    log('\nAdding payment method for Alice...', 'blue');
    const alicePayment = await makeRequest('POST', `/api/users/${alice.id}/payment-methods`, {
      paymentMethodId: 'pm_card_visa'
    });
    log(`✓ Payment method added: ${alicePayment.paymentMethod.brand} ending in ${alicePayment.paymentMethod.last4}`, 'green');

    log('\nAdding payment method for Bob...', 'blue');
    const bobPayment = await makeRequest('POST', `/api/users/${bob.id}/payment-methods`, {
      paymentMethodId: 'pm_card_visa'
    });
    log(`✓ Payment method added: ${bobPayment.paymentMethod.brand} ending in ${bobPayment.paymentMethod.last4}`, 'green');

    // Step 4: Create bet
    section('4. Creating Bet with Pre-Authorization');
    log('Alice creates a bet: "I can run a mile in under 6 minutes"', 'blue');
    log('Bet amount: $50.00', 'blue');
    
    const betResponse = await makeRequest('POST', '/api/bets', {
      creatorId: alice.id,
      description: 'I can run a mile in under 6 minutes',
      amount: 5000, // $50.00 in cents
      paymentMethodId: 'pm_card_visa'
    });
    
    const bet = betResponse.bet;
    log(`✓ Bet created with ID: ${bet.id}`, 'green');
    log(`  Status: ${bet.status}`, 'yellow');
    log(`  ✓ Alice's card has been pre-authorized (funds held, not charged)`, 'green');
    log(`  Authorization ID: ${bet.creatorAuthorizationId}`, 'yellow');

    // Step 5: Join bet
    section('5. Bob Joins the Bet');
    log('Bob accepts the bet and joins', 'blue');
    
    const joinResponse = await makeRequest('POST', `/api/bets/${bet.id}/join`, {
      opponentId: bob.id,
      paymentMethodId: 'pm_card_visa'
    });
    
    const authorizedBet = joinResponse.bet;
    log(`✓ Bob joined the bet`, 'green');
    log(`  Status: ${authorizedBet.status}`, 'yellow');
    log(`  ✓ Bob's card has been pre-authorized (funds held, not charged)`, 'green');
    log(`  Authorization ID: ${authorizedBet.opponentAuthorizationId}`, 'yellow');
    log('\n  💡 Both participants now have $50 held on their cards', 'cyan');
    log('  💡 No money has moved yet - funds are just reserved', 'cyan');

    // Step 6: Declare winner
    section('6. Declaring Winner & Processing Payment');
    log('Alice wins! Processing payment...', 'blue');
    
    const winnerResponse = await makeRequest('POST', `/api/bets/${bet.id}/declare-winner`, {
      winnerId: alice.id
    });
    
    const completedBet = winnerResponse.bet;
    log(`✓ Winner declared: ${completedBet.winnerId}`, 'green');
    log(`  Status: ${completedBet.status}`, 'yellow');
    log(`\n  What happened:`, 'cyan');
    log(`  1. ✓ Bob's pre-authorization was CAPTURED (his card was charged $50)`, 'green');
    log(`  2. ✓ Alice's pre-authorization was RELEASED (no charge, hold removed)`, 'green');
    log(`  3. ✓ Money flows from Bob to Alice via Stripe`, 'green');
    log(`  4. ✓ iBetcha never touched the money (no regulatory risk!)`, 'green');

    // Step 7: View bet details
    section('7. Viewing Final Bet Details');
    const finalBet = await makeRequest('GET', `/api/bets/${bet.id}`);
    log(JSON.stringify(finalBet, null, 2), 'yellow');

    // Step 8: View transactions
    section('8. Viewing Transaction History');
    const transactions = await makeRequest('GET', `/api/bets/${bet.id}/transactions`);
    log(`Total transactions: ${transactions.length}`, 'green');
    if (transactions.length > 0) {
      log(JSON.stringify(transactions[0], null, 2), 'yellow');
    }

    // Summary
    section('✨ Demo Complete!');
    log('The pre-authorization escrow system successfully:', 'green');
    log('  ✓ Pre-authorized both users\' cards (held funds)', 'green');
    log('  ✓ Charged the loser when winner was declared', 'green');
    log('  ✓ Released the winner\'s hold', 'green');
    log('  ✓ Transferred money directly from loser to winner', 'green');
    log('  ✓ Platform never held the money (no regulatory risk!)', 'green');
    log('\nThis is the same mechanism hotels use for holds! 🏨', 'cyan');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('\nMake sure:', 'yellow');
    log('  1. The server is running (npm start or npm run dev)', 'yellow');
    log('  2. You have a valid STRIPE_SECRET_KEY in your .env file', 'yellow');
    log('  3. You\'re using a Stripe test key (sk_test_...)', 'yellow');
    process.exit(1);
  }
}

// Run the demo
if (require.main === module) {
  log('\n🚀 Starting iBetcha Demo...', 'cyan');
  log('Make sure the server is running on ' + BASE_URL, 'yellow');
  log('Press Ctrl+C to cancel\n', 'yellow');
  
  setTimeout(() => {
    runDemo();
  }, 1000);
}

module.exports = { runDemo };
