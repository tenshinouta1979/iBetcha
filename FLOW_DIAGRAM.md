# Pre-Authorization Escrow Flow Diagram

## Complete Bet Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CREDIT CARD PRE-AUTHORIZATION FLOW                    │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: CREATE BET
─────────────────────────────────────────────────────────────────────────

    ┌──────────┐
    │  Alice   │  "I bet I can run a mile in under 6 minutes"
    │ (Creator)│  Amount: $50
    └─────┬────┘
          │
          │ POST /api/bets
          │ { creatorId, description, amount, paymentMethodId }
          ↓
    ┌─────────────┐
    │  iBetcha    │  1. Create bet record
    │     API     │  2. Pre-authorize Alice's card
    └──────┬──────┘
           │
           │ Create Payment Intent with capture_method='manual'
           ↓
    ┌─────────────┐
    │   Stripe    │  Pre-authorize $50 on Alice's card
    │  (Payment)  │  ✓ Funds HELD (not charged)
    └─────────────┘

    Result:
    ┌─────────────────────────────────────────┐
    │ Bet Status: PENDING                     │
    │ Alice's Card: $50 HELD (not charged)    │
    │ Waiting for opponent...                 │
    └─────────────────────────────────────────┘


STEP 2: JOIN BET
─────────────────────────────────────────────────────────────────────────

    ┌──────────┐
    │   Bob    │  "I accept the bet!"
    │(Opponent)│
    └─────┬────┘
          │
          │ POST /api/bets/:id/join
          │ { opponentId, paymentMethodId }
          ↓
    ┌─────────────┐
    │  iBetcha    │  1. Update bet record
    │     API     │  2. Pre-authorize Bob's card
    └──────┬──────┘
           │
           │ Create Payment Intent with capture_method='manual'
           ↓
    ┌─────────────┐
    │   Stripe    │  Pre-authorize $50 on Bob's card
    │  (Payment)  │  ✓ Funds HELD (not charged)
    └─────────────┘

    Result:
    ┌─────────────────────────────────────────┐
    │ Bet Status: AUTHORIZED                  │
    │ Alice's Card: $50 HELD                  │
    │ Bob's Card:   $50 HELD                  │
    │ Ready for winner declaration!           │
    └─────────────────────────────────────────┘


STEP 3: DECLARE WINNER (Alice Wins)
─────────────────────────────────────────────────────────────────────────

    ┌──────────┐
    │  Admin   │  "Alice wins the bet"
    │   or     │
    │ Arbiter  │
    └─────┬────┘
          │
          │ POST /api/bets/:id/declare-winner
          │ { winnerId: alice.id }
          ↓
    ┌─────────────┐
    │  iBetcha    │  1. Identify loser (Bob)
    │     API     │  2. Capture loser's pre-auth
    └──────┬──────┘  3. Release winner's pre-auth
           │
           ├─────────────────────────────────────┐
           │                                     │
           │ Capture Payment Intent              │ Cancel Payment Intent
           ↓                                     ↓
    ┌──────────────┐                     ┌──────────────┐
    │    Stripe    │                     │    Stripe    │
    │   (Bob's     │  CHARGE $50         │  (Alice's    │  RELEASE
    │    card)     │  ✓ Card charged     │    card)     │  ✓ Hold removed
    └──────────────┘                     └──────────────┘
           │
           │ Money flows from Bob to Alice
           │ (Platform never touches it)
           ↓

    Result:
    ┌─────────────────────────────────────────┐
    │ Bet Status: COMPLETED                   │
    │ Winner: Alice                           │
    │                                         │
    │ Bob's Card:   CHARGED $50 ✓             │
    │ Alice's Card: HOLD RELEASED ✓           │
    │                                         │
    │ Money Flow: Bob → Alice (via Stripe)    │
    │ Platform:   Never touched the money!    │
    └─────────────────────────────────────────┘


ALTERNATIVE: CANCEL BET
─────────────────────────────────────────────────────────────────────────

    ┌──────────┐
    │  Anyone  │  "Cancel this bet"
    └─────┬────┘
          │
          │ POST /api/bets/:id/cancel
          ↓
    ┌─────────────┐
    │  iBetcha    │  1. Cancel Payment Intent (Alice)
    │     API     │  2. Cancel Payment Intent (Bob)
    └──────┬──────┘
           │
           ├─────────────────────────────────────┐
           │                                     │
           ↓                                     ↓
    ┌──────────────┐                     ┌──────────────┐
    │    Stripe    │                     │    Stripe    │
    │  (Alice's    │  RELEASE            │   (Bob's     │  RELEASE
    │    card)     │  ✓ Hold removed     │    card)     │  ✓ Hold removed
    └──────────────┘                     └──────────────┘

    Result:
    ┌─────────────────────────────────────────┐
    │ Bet Status: CANCELLED                   │
    │                                         │
    │ Alice's Card: HOLD RELEASED ✓           │
    │ Bob's Card:   HOLD RELEASED ✓           │
    │                                         │
    │ No charges made to anyone!              │
    └─────────────────────────────────────────┘


KEY CONCEPTS
─────────────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────────┐
│  PRE-AUTHORIZATION (HOLD)                                           │
├─────────────────────────────────────────────────────────────────────┤
│  • Reserves funds on the card                                       │
│  • No actual charge is made                                         │
│  • User sees "pending" transaction                                  │
│  • Can be captured (charged) or released (voided) later             │
│  • Expires after 7 days if not captured                             │
│  • Same mechanism hotels use for deposits                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  CAPTURE                                                            │
├─────────────────────────────────────────────────────────────────────┤
│  • Converts the pre-authorization into an actual charge             │
│  • Money is transferred from user's account                         │
│  • Used to charge the loser when winner is declared                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  RELEASE (VOID)                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  • Cancels the pre-authorization                                    │
│  • Removes the hold from user's card                                │
│  • No charge is made                                                │
│  • Used for winner's card and when bet is cancelled                 │
└─────────────────────────────────────────────────────────────────────┘


BENEFITS SUMMARY
─────────────────────────────────────────────────────────────────────────

┌──────────────────────────────────────────────────────────────────┐
│  FOR USERS                                                       │
├──────────────────────────────────────────────────────────────────┤
│  ✓ Cannot back out (funds are already reserved)                 │
│  ✓ Fair and automatic payment                                    │
│  ✓ No trust needed in opponent                                   │
│  ✓ Transparent process                                           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  FOR PLATFORM (iBetcha)                                          │
├──────────────────────────────────────────────────────────────────┤
│  ✓ Never holds user funds (no regulatory risk)                  │
│  ✓ No money transmitter license needed                          │
│  ✓ No liability for funds                                        │
│  ✓ Industry-standard, proven approach                            │
│  ✓ Payment processor handles everything                          │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  LEGAL & COMPLIANCE                                              │
├──────────────────────────────────────────────────────────────────┤
│  ✓ Platform never touches the money                             │
│  ✓ No income (pre-auths are not income until captured)          │
│  ✓ No tax implications for platform                             │
│  ✓ Money flows directly between users via Stripe                │
│  ✓ Stripe handles all payment compliance                        │
└──────────────────────────────────────────────────────────────────┘


DATA FLOW
─────────────────────────────────────────────────────────────────────────

    User A's Card  ←─────┐
                         │
                         │  Pre-authorization
                         │  (Hold funds)
                         │
                    ┌────┴─────┐
                    │  Stripe  │  ← Never passes through platform
                    └────┬─────┘
                         │
                         │  Pre-authorization
                         │  (Hold funds)
                         │
    User B's Card  ←─────┘


    After Winner Declaration:

    User B's Card  ─────→  [CHARGE $50]  ─────→  User A's Account
                             via Stripe
                             
    iBetcha Platform: Never touched the money! ✓
```
