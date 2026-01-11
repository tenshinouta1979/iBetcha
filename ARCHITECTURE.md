# iBetcha Architecture

## Overview

iBetcha is a React Native mobile application that implements a simple betting platform for friendly challenges between users. The architecture follows a clean, modular design with clear separation of concerns.

## Architecture Layers

### 1. Presentation Layer (UI)
**Location**: `src/screens/`

The presentation layer consists of React Native components that handle user interface and user interactions.

#### Components:
- **HomeScreen**: Main dashboard showing all challenges and user balance
- **CreateChallengeScreen**: Form for creating new challenges
- **ChallengeDetailScreen**: Detailed view of a challenge with context-aware actions

**Responsibilities**:
- Render UI components
- Handle user input and interactions
- Display data from services
- Navigate between screens

### 2. Business Logic Layer
**Location**: `src/services/`

Contains the core business logic and state management.

#### ChallengeService
Singleton service that manages:
- Challenge lifecycle (create, accept, lock, complete, cancel)
- User balance management
- Validation and business rules
- In-memory data storage

**Key Operations**:
- `createChallenge()` - Creates a new pending challenge
- `acceptChallenge()` - Opponent accepts the challenge
- `lockChallenge()` - Locks wagers from both parties
- `completeChallenge()` - Verifies outcome and awards winner
- `cancelChallenge()` - Cancels a pending challenge

### 3. Data Model Layer
**Location**: `src/models/`

Defines the data structures and domain models.

#### Models:
- **Challenge**: Represents a betting challenge
- **User**: Represents a participant with balance

**Responsibilities**:
- Define data structure
- Provide helper methods
- Encapsulate domain logic

### 4. Navigation Layer
**Location**: `src/navigation/`

Manages screen navigation and routing.

#### AppNavigator
Uses React Navigation stack navigator to:
- Define screen hierarchy
- Handle navigation between screens
- Configure screen options

## Data Flow

```
User Action (UI)
    ↓
Screen Component
    ↓
ChallengeService
    ↓
Business Logic + Validation
    ↓
Update Models & State
    ↓
Return Updated Data
    ↓
UI Re-renders
```

## State Management

Currently uses a simple in-memory state management approach:
- **ChallengeService** acts as a singleton store
- State is maintained in service instance variables
- UI components read state directly from service
- No external state management library (Redux, MobX) needed for MVP

### Current State:
- `challenges[]` - Array of all challenges
- `users{}` - Object mapping user IDs to User instances
- `currentUserId` - ID of the logged-in user

## Challenge State Machine

```
┌─────────┐
│ PENDING │ ──(accept)──> ┌──────────┐
└─────────┘               │ ACCEPTED │
    │                     └──────────┘
    │                          │
 (cancel)                   (lock)
    │                          │
    ↓                          ↓
┌───────────┐             ┌────────┐
│ CANCELLED │             │ LOCKED │
└───────────┘             └────────┘
                               │
                          (complete)
                               │
                               ↓
                          ┌───────────┐
                          │ COMPLETED │
                          └───────────┘
```

## Key Design Decisions

### 1. In-Memory Storage
**Decision**: Store all data in memory via singleton service

**Rationale**: 
- Simplifies MVP development
- No backend dependency for demo
- Easy to test and understand

**Trade-offs**:
- Data lost on app restart
- No synchronization between devices
- Not suitable for production

**Future**: Migrate to backend API + local persistence

### 2. Singleton Service Pattern
**Decision**: Use singleton ChallengeService

**Rationale**:
- Single source of truth for data
- Simple state management
- Easy access from any component

**Trade-offs**:
- Harder to test in isolation
- Can become complex as app grows

**Future**: Consider Redux or Context API for larger scale

### 3. Optimistic UI
**Decision**: Update UI immediately after actions

**Rationale**:
- Better user experience
- Simpler code for MVP
- In-memory storage is synchronous

**Trade-offs**:
- Would need rollback logic with real backend
- May show inconsistent state on errors

### 4. Simple Authentication
**Decision**: Hardcoded current user (user1)

**Rationale**:
- Focuses on core betting functionality
- Reduces complexity for MVP

**Trade-offs**:
- Not production-ready
- Can't switch users without code changes

**Future**: Implement real authentication system

## Security Considerations

### Current Implementation
⚠️ This is a demo/MVP - **NOT production-ready**

**Missing Security Features**:
- No real authentication
- No authorization checks
- No encryption
- No audit logging
- No dispute resolution
- No fraud prevention

### Production Requirements

For production deployment, implement:

1. **Authentication & Authorization**
   - JWT or OAuth tokens
   - Role-based access control
   - Session management

2. **Transaction Security**
   - Escrow service for wagers
   - Two-factor authentication for withdrawals
   - Transaction signing/verification

3. **Data Protection**
   - HTTPS/TLS for all communications
   - Encrypted storage for sensitive data
   - PCI compliance for payment processing

4. **Dispute Resolution**
   - Evidence submission system
   - Admin panel for reviewing disputes
   - Timeout/expiration mechanisms

5. **Audit & Compliance**
   - Complete audit trail
   - Compliance with gambling regulations
   - Age verification
   - Responsible gambling features

## Testing Strategy

### Unit Tests
**Location**: `__tests__/`

Test coverage includes:
- Model methods and logic
- Service operations
- Business rule validation
- State transitions

**Key Test Suites**:
- `Challenge.test.js` - Challenge model tests
- `User.test.js` - User model tests
- `ChallengeService.test.js` - Service logic tests

### Future Testing
- Integration tests for screen components
- E2E tests with Detox
- Snapshot tests for UI consistency

## Performance Considerations

### Current Performance
- All operations are synchronous and in-memory
- O(n) lookups for challenges by ID
- No pagination on challenge list

### Optimization Opportunities
1. **Indexing**: Use Map instead of Array for O(1) lookups
2. **Pagination**: Implement virtual scrolling for long lists
3. **Caching**: Cache derived data (active challenges, etc.)
4. **Lazy Loading**: Load challenge details on demand

## Scalability Path

### Phase 1: Current (MVP)
- In-memory storage
- Single user simulation
- Basic CRUD operations

### Phase 2: Backend Integration
- REST/GraphQL API
- Database (PostgreSQL/MongoDB)
- Real authentication
- User profiles

### Phase 3: Real-Time Features
- WebSocket for live updates
- Push notifications
- Chat between participants
- Live challenge tracking

### Phase 4: Production Features
- Payment gateway integration
- Dispute resolution system
- Social features (friends, feeds)
- Analytics and reporting

## Code Organization Best Practices

### File Naming
- PascalCase for components and classes
- camelCase for utilities and services
- Test files: `*.test.js`

### Import Structure
1. React/React Native imports
2. Third-party libraries
3. Local components/services
4. Models and utilities
5. Styles

### Component Structure
1. Imports
2. Component definition
3. Helper functions
4. Styles
5. Export

## Dependencies

### Core Dependencies
- `react` & `react-native` - Framework
- `@react-navigation/*` - Navigation
- `uuid` - ID generation

### Dev Dependencies
- `jest` - Testing framework
- `eslint` - Code linting
- `babel` - JavaScript compilation

## Future Enhancements

### Technical Improvements
1. TypeScript migration for type safety
2. Redux/Context API for state management
3. React Query for server state
4. Formik for form handling
5. React Native Paper for UI components

### Feature Additions
1. Photo/video evidence upload
2. Social features (friends, feed)
3. Push notifications
4. In-app messaging
5. Challenge templates
6. Leaderboards and statistics
7. Multiple payment methods
8. Cryptocurrency support

## Contributing Guidelines

When contributing to the architecture:

1. **Maintain Separation of Concerns**
   - Keep business logic in services
   - Keep UI logic in components
   - Keep data structure in models

2. **Follow Existing Patterns**
   - Use service methods for data operations
   - Use navigation for screen transitions
   - Use models for data validation

3. **Write Tests**
   - Unit tests for all business logic
   - Integration tests for critical flows

4. **Document Changes**
   - Update this document for architectural changes
   - Add inline comments for complex logic
   - Update README for user-facing changes
