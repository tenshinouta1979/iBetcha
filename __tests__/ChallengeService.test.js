import ChallengeService from '../src/services/ChallengeService';
import { ChallengeStatus } from '../src/models/Challenge';

describe('ChallengeService', () => {
  beforeEach(() => {
    // Reset service state before each test
    ChallengeService.challenges = [];
    ChallengeService.users = ChallengeService.initializeUsers();
  });

  test('should create a new challenge', () => {
    const challenge = ChallengeService.createChallenge(
      'user2',
      'Alice',
      'Basketball 1v1',
      'First to 21 points',
      50
    );

    expect(challenge).toBeDefined();
    expect(challenge.description).toBe('Basketball 1v1');
    expect(challenge.stake).toBe(50);
    expect(challenge.status).toBe(ChallengeStatus.PENDING);
    expect(ChallengeService.challenges.length).toBe(1);
  });

  test('should not create challenge with insufficient balance', () => {
    expect(() => {
      ChallengeService.createChallenge(
        'user2',
        'Alice',
        'Test Challenge',
        'Test Condition',
        2000
      );
    }).toThrow('Insufficient balance');
  });

  test('should accept a challenge', () => {
    const challenge = ChallengeService.createChallenge(
      'user2',
      'Alice',
      'Basketball 1v1',
      'First to 21 points',
      50
    );

    const accepted = ChallengeService.acceptChallenge(challenge.id);
    
    expect(accepted.status).toBe(ChallengeStatus.ACCEPTED);
    expect(accepted.acceptedAt).toBeDefined();
  });

  test('should lock wagers for accepted challenge', () => {
    const challenge = ChallengeService.createChallenge(
      'user2',
      'Alice',
      'Basketball 1v1',
      'First to 21 points',
      50
    );

    ChallengeService.acceptChallenge(challenge.id);
    
    const user1BalanceBefore = ChallengeService.getCurrentUser().balance;
    const user2BalanceBefore = ChallengeService.getUserById('user2').balance;

    const locked = ChallengeService.lockChallenge(challenge.id);
    
    expect(locked.status).toBe(ChallengeStatus.LOCKED);
    expect(ChallengeService.getCurrentUser().balance).toBe(user1BalanceBefore - 50);
    expect(ChallengeService.getUserById('user2').balance).toBe(user2BalanceBefore - 50);
  });

  test('should complete challenge and award winner', () => {
    const challenge = ChallengeService.createChallenge(
      'user2',
      'Alice',
      'Basketball 1v1',
      'First to 21 points',
      50
    );

    ChallengeService.acceptChallenge(challenge.id);
    ChallengeService.lockChallenge(challenge.id);

    const winnerBalanceBefore = ChallengeService.getCurrentUser().balance;
    
    const completed = ChallengeService.completeChallenge(challenge.id, 'user1');
    
    expect(completed.status).toBe(ChallengeStatus.COMPLETED);
    expect(completed.winnerId).toBe('user1');
    expect(ChallengeService.getCurrentUser().balance).toBe(winnerBalanceBefore + 100);
  });

  test('should cancel pending challenge', () => {
    const challenge = ChallengeService.createChallenge(
      'user2',
      'Alice',
      'Basketball 1v1',
      'First to 21 points',
      50
    );

    const cancelled = ChallengeService.cancelChallenge(challenge.id);
    
    expect(cancelled.status).toBe(ChallengeStatus.CANCELLED);
  });

  test('should not cancel non-pending challenge', () => {
    const challenge = ChallengeService.createChallenge(
      'user2',
      'Alice',
      'Basketball 1v1',
      'First to 21 points',
      50
    );

    ChallengeService.acceptChallenge(challenge.id);

    expect(() => {
      ChallengeService.cancelChallenge(challenge.id);
    }).toThrow('Only pending challenges can be cancelled');
  });

  test('should get all challenges', () => {
    ChallengeService.createChallenge('user2', 'Alice', 'Challenge 1', 'Condition 1', 50);
    ChallengeService.createChallenge('user3', 'Bob', 'Challenge 2', 'Condition 2', 30);

    const allChallenges = ChallengeService.getAllChallenges();
    expect(allChallenges.length).toBe(2);
  });

  test('should filter active challenges', () => {
    const c1 = ChallengeService.createChallenge('user2', 'Alice', 'Challenge 1', 'Condition 1', 50);
    const c2 = ChallengeService.createChallenge('user3', 'Bob', 'Challenge 2', 'Condition 2', 30);
    
    ChallengeService.acceptChallenge(c1.id);

    const activeChallenges = ChallengeService.getActiveChallenges();
    expect(activeChallenges.length).toBe(1);
    expect(activeChallenges[0].id).toBe(c1.id);
  });
});
