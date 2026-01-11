# User Flow Documentation

## Complete User Journey

This document describes the complete user flow through the iBetcha application.

## Flow Diagram

```
┌─────────────────┐
│   Home Screen   │ ← Entry point
│                 │
│ - View Balance  │
│ - List of      │
│   Challenges    │
└────────┬────────┘
         │
         ├──────────────────────────┬────────────────────┐
         │                          │                    │
         ↓                          ↓                    ↓
┌─────────────────┐        ┌─────────────────┐  ┌──────────────────┐
│ Create New      │        │ View Pending    │  │ View Active/     │
│ Challenge       │        │ Challenge       │  │ Completed        │
│                 │        │ (as opponent)   │  │ Challenges       │
└────────┬────────┘        └────────┬────────┘  └────────┬─────────┘
         │                          │                     │
         ↓                          ↓                     │
┌─────────────────┐        ┌─────────────────┐          │
│ Fill Details:   │        │ Accept or       │          │
│ - Description   │        │ Decline         │          │
│ - Condition     │        └────────┬────────┘          │
│ - Opponent      │                 │                    │
│ - Stake         │                 ↓                    │
└────────┬────────┘        ┌─────────────────┐          │
         │                 │ Challenge        │          │
         ↓                 │ ACCEPTED         │          │
┌─────────────────┐        └────────┬────────┘          │
│ Submit          │                 │                    │
└────────┬────────┘                 ↓                    ↓
         │                 ┌─────────────────┐  ┌──────────────────┐
         │                 │ Lock Wagers     │  │ View Details     │
         │                 │ (deduct stakes) │  │ and Status       │
         │                 └────────┬────────┘  └──────────────────┘
         │                          │
         ↓                          ↓
┌─────────────────┐        ┌─────────────────┐
│ Challenge       │        │ Challenge       │
│ PENDING         │        │ LOCKED          │
└─────────────────┘        └────────┬────────┘
                                    │
                                    ↓
                          ┌─────────────────┐
                          │ Complete IRL    │
                          │ Challenge       │
                          └────────┬────────┘
                                   │
                                   ↓
                          ┌─────────────────┐
                          │ Verify Outcome  │
                          │ (Select Winner) │
                          └────────┬────────┘
                                   │
                                   ↓
                          ┌─────────────────┐
                          │ Award Full Pot  │
                          │ to Winner       │
                          └────────┬────────┘
                                   │
                                   ↓
                          ┌─────────────────┐
                          │ Challenge       │
                          │ COMPLETED       │
                          └─────────────────┘
```

## Detailed Screen Flows

### 1. Home Screen Flow

**Screen Purpose**: Dashboard to view all challenges and create new ones

**User Can**:
- View their current balance
- See all challenges sorted by creation date
- View challenge status (color-coded badges)
- Tap on any challenge to view details
- Tap "Create Challenge" to start a new challenge

**Visual Elements**:
- Header with app name and balance
- List of challenge cards with:
  - Title (description)
  - Status badge (colored)
  - Condition
  - Participants
  - Stake and pot amount
- Floating action button to create challenge

### 2. Create Challenge Flow

**Navigation**: Home → Create Challenge

**Steps**:
1. User taps "Create Challenge" button
2. Form appears with fields:
   - Challenge Description (text input)
   - Winning Condition (text input)
   - Opponent Selector (button group)
   - Stake Amount (numeric input)
3. Real-time validation:
   - Check if stake amount is valid
   - Check if user has sufficient balance
   - Calculate and show total pot
4. User taps "Create Challenge"
5. Validation runs
6. If valid:
   - Challenge created with PENDING status
   - Success alert shown
   - Navigate back to home
7. If invalid:
   - Error alert shown
   - User remains on form

**Validation Rules**:
- Description cannot be empty
- Condition cannot be empty
- Stake must be a positive number
- Stake must not exceed user balance

### 3. Accept Challenge Flow

**Navigation**: Home → Challenge Detail (as opponent)

**Pre-conditions**:
- Challenge status is PENDING
- Current user is the opponent

**Steps**:
1. User views pending challenge details
2. Reviews:
   - Challenge description
   - Winning condition
   - Stake amount
   - Total pot
   - Creator name
3. Taps "Accept Challenge"
4. Confirmation dialog appears
5. User confirms
6. System checks opponent balance
7. If sufficient:
   - Challenge status → ACCEPTED
   - Success alert shown
   - UI updates to show "Lock Wagers" button
8. If insufficient:
   - Error alert shown
   - Challenge remains PENDING

### 4. Lock Wagers Flow

**Navigation**: Home → Challenge Detail

**Pre-conditions**:
- Challenge status is ACCEPTED

**Steps**:
1. Either party views accepted challenge
2. Reviews terms one final time
3. Taps "Lock Wagers"
4. Confirmation dialog warns about stake deduction
5. User confirms
6. System:
   - Deducts stake from creator
   - Deducts stake from opponent
   - Updates balances
   - Challenge status → LOCKED
7. Success alert shown
8. UI updates with verify outcome options

**Important**: Both parties' stakes are deducted simultaneously

### 5. Verify Outcome Flow

**Navigation**: Home → Challenge Detail

**Pre-conditions**:
- Challenge status is LOCKED
- Real-world challenge has been completed

**Steps**:
1. Either party views locked challenge
2. Section appears: "Verify Outcome"
3. Two buttons shown:
   - "[Creator Name] Won"
   - "[Opponent Name] Won"
4. User taps appropriate winner button
5. Confirmation dialog shows:
   - Winner name
   - Prize amount (total pot)
6. User confirms
7. System:
   - Awards full pot to winner
   - Updates winner's balance
   - Challenge status → COMPLETED
   - Records winner ID and completion time
8. Success alert shows winner and prize
9. UI updates to show completed status

### 6. Cancel Challenge Flow

**Navigation**: Home → Challenge Detail (as creator)

**Pre-conditions**:
- Challenge status is PENDING
- Current user is the creator

**Steps**:
1. Creator views pending challenge
2. Taps "Cancel Challenge"
3. Confirmation dialog appears
4. User confirms
5. Challenge status → CANCELLED
6. Alert shown
7. Navigate back to home

**Note**: Only pending challenges can be cancelled

## State Transitions

### Challenge Status States

1. **PENDING** (Orange Badge)
   - Just created
   - Waiting for opponent to accept
   - Can be cancelled by creator
   - **Next**: ACCEPTED or CANCELLED

2. **ACCEPTED** (Green Badge)
   - Opponent has agreed to terms
   - Ready to lock wagers
   - Both parties committed
   - **Next**: LOCKED

3. **LOCKED** (Blue Badge)
   - Stakes deducted from both parties
   - Challenge is in progress
   - Waiting for outcome verification
   - **Next**: COMPLETED

4. **COMPLETED** (Gray Badge)
   - Winner determined
   - Pot awarded
   - Final state
   - **Next**: None (terminal state)

5. **CANCELLED** (Red Badge)
   - Challenge cancelled before acceptance
   - Final state
   - **Next**: None (terminal state)

## User Actions by Role

### As Challenge Creator

**When PENDING**:
- View challenge details
- Cancel challenge
- Wait for opponent to accept

**When ACCEPTED**:
- Lock wagers
- View challenge details

**When LOCKED**:
- Verify outcome (select winner)
- View challenge details

**When COMPLETED**:
- View final results

### As Challenge Opponent

**When PENDING**:
- View challenge details
- Accept challenge
- (Implicitly decline by not accepting)

**When ACCEPTED**:
- Lock wagers
- View challenge details

**When LOCKED**:
- Verify outcome (select winner)
- View challenge details

**When COMPLETED**:
- View final results

### As Observer (neither party)

All States:
- View challenge details
- No action buttons available

## Balance Management

### When Balance Changes

**Challenge Created (PENDING)**:
- No balance change
- Stake is reserved but not deducted

**Challenge Accepted (ACCEPTED)**:
- No balance change yet
- Both parties' stakes are reserved

**Wagers Locked (LOCKED)**:
- Creator balance: -stake
- Opponent balance: -stake
- Pot is now held by system

**Challenge Completed (COMPLETED)**:
- Winner balance: +totalPot
- Loser balance: no change (already deducted)

**Challenge Cancelled (CANCELLED)**:
- No balance changes
- Stakes were never deducted

### Balance Display

- Always shown in Home Screen header
- Updated in real-time after transactions
- Shown in Create Challenge screen
- Validated before creating/accepting challenges

## Error Handling

### Common Errors

1. **Insufficient Balance**
   - When: Creating or accepting challenge
   - Message: "Insufficient balance. You have $X"
   - Action: User must reduce stake or cancel

2. **Invalid Input**
   - When: Creating challenge with empty fields
   - Message: Specific field error
   - Action: User must fill required fields

3. **Invalid State Transition**
   - When: Trying to perform action in wrong state
   - Message: "Challenge cannot be [action] in current state"
   - Action: Refresh view

4. **Challenge Not Found**
   - When: Challenge ID is invalid
   - Message: "Challenge not found"
   - Action: Return to home

## UI/UX Principles

### Color Coding
- **Purple (#6200EE)**: Primary actions, branding
- **Orange**: Pending/warning state
- **Green**: Accepted/success state
- **Blue**: Locked/in-progress state
- **Gray**: Completed/inactive state
- **Red**: Cancelled/error state

### Typography
- **28px Bold**: Screen titles
- **24px Bold**: Section headers
- **18px Semi-bold**: Button text, card titles
- **16px**: Body text, form labels
- **14px**: Secondary text, captions

### Spacing
- **20px**: Screen padding
- **15px**: Card padding
- **10px**: Card margins
- **8px**: Element margins

### Interactive Elements
- All buttons have clear labels
- Confirmation dialogs for destructive actions
- Success feedback for all actions
- Error messages are specific and helpful

## Accessibility Considerations

- Clear visual hierarchy
- Color is not the only indicator (text labels too)
- Large touch targets (minimum 44px)
- Clear feedback for all interactions
- Readable font sizes
- High contrast text

## Future Enhancements

1. **Pull to refresh** on home screen
2. **Search and filter** challenges
3. **Sort options** (by date, stake, status)
4. **Tabs** for different challenge states
5. **Profile screen** with statistics
6. **Settings screen** for preferences
7. **Notification system** for challenge updates
8. **Image upload** for evidence
9. **Chat feature** between parties
10. **Appeal/dispute** mechanism
