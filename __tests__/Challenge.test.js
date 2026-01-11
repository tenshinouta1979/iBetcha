import { Challenge, ChallengeStatus } from '../src/models/Challenge';

describe('Challenge Model', () => {
  let challenge;

  beforeEach(() => {
    challenge = new Challenge(
      '1',
      'user1',
      'Alice',
      'user2',
      'Bob',
      'Basketball 1v1',
      'First to 21 points',
      50,
      ChallengeStatus.PENDING,
      new Date()
    );
  });

  test('should create a challenge with correct properties', () => {
    expect(challenge.id).toBe('1');
    expect(challenge.creatorId).toBe('user1');
    expect(challenge.creatorName).toBe('Alice');
    expect(challenge.opponentId).toBe('user2');
    expect(challenge.opponentName).toBe('Bob');
    expect(challenge.description).toBe('Basketball 1v1');
    expect(challenge.condition).toBe('First to 21 points');
    expect(challenge.stake).toBe(50);
    expect(challenge.status).toBe(ChallengeStatus.PENDING);
  });

  test('should calculate total pot correctly', () => {
    expect(challenge.getTotalPot()).toBe(100);
  });

  test('should identify pending status correctly', () => {
    expect(challenge.isPending()).toBe(true);
    expect(challenge.isActive()).toBe(false);
    expect(challenge.isCompleted()).toBe(false);
  });

  test('should identify active status correctly', () => {
    challenge.status = ChallengeStatus.ACCEPTED;
    expect(challenge.isActive()).toBe(true);
    expect(challenge.isPending()).toBe(false);

    challenge.status = ChallengeStatus.LOCKED;
    expect(challenge.isActive()).toBe(true);
  });

  test('should identify completed status correctly', () => {
    challenge.status = ChallengeStatus.COMPLETED;
    expect(challenge.isCompleted()).toBe(true);
    expect(challenge.isActive()).toBe(false);
  });
});
