import { Challenge, ChallengeStatus } from '../models/Challenge';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';

/**
 * ChallengeService manages all challenge-related operations
 * In a real app, this would interact with a backend API
 */
class ChallengeService {
  constructor() {
    this.challenges = [];
    this.users = this.initializeUsers();
    this.currentUserId = 'user1'; // Simulating logged-in user
  }

  initializeUsers() {
    return {
      user1: new User('user1', 'You', 1000),
      user2: new User('user2', 'Alice', 1000),
      user3: new User('user3', 'Bob', 1000),
      user4: new User('user4', 'Charlie', 1000),
    };
  }

  getCurrentUser() {
    return this.users[this.currentUserId];
  }

  getAllUsers() {
    return Object.values(this.users).filter(user => user.id !== this.currentUserId);
  }

  getUserById(userId) {
    return this.users[userId];
  }

  /**
   * Create a new challenge
   */
  createChallenge(opponentId, opponentName, description, condition, stake) {
    const currentUser = this.getCurrentUser();

    if (!currentUser.canAfford(stake)) {
      throw new Error('Insufficient balance to create this challenge');
    }

    const challenge = new Challenge(
      uuidv4(),
      currentUser.id,
      currentUser.name,
      opponentId,
      opponentName,
      description,
      condition,
      stake,
      ChallengeStatus.PENDING,
      new Date()
    );

    this.challenges.push(challenge);
    return challenge;
  }

  /**
   * Accept a challenge
   */
  acceptChallenge(challengeId) {
    const challenge = this.getChallengeById(challengeId);
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new Error('Challenge cannot be accepted');
    }

    const opponent = this.getUserById(challenge.opponentId);
    if (!opponent.canAfford(challenge.stake)) {
      throw new Error('Insufficient balance to accept this challenge');
    }

    challenge.status = ChallengeStatus.ACCEPTED;
    challenge.acceptedAt = new Date();

    return challenge;
  }

  /**
   * Lock the wager - both parties have committed
   */
  lockChallenge(challengeId) {
    const challenge = this.getChallengeById(challengeId);
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.status !== ChallengeStatus.ACCEPTED) {
      throw new Error('Challenge must be accepted before locking');
    }

    const creator = this.getUserById(challenge.creatorId);
    const opponent = this.getUserById(challenge.opponentId);

    // Deduct stakes from both users
    if (!creator.deductBalance(challenge.stake)) {
      throw new Error('Creator has insufficient balance');
    }

    if (!opponent.deductBalance(challenge.stake)) {
      creator.addBalance(challenge.stake); // Refund creator
      throw new Error('Opponent has insufficient balance');
    }

    challenge.status = ChallengeStatus.LOCKED;
    return challenge;
  }

  /**
   * Verify outcome and award winner
   */
  completeChallenge(challengeId, winnerId) {
    const challenge = this.getChallengeById(challengeId);
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.status !== ChallengeStatus.LOCKED) {
      throw new Error('Challenge must be locked before completion');
    }

    if (winnerId !== challenge.creatorId && winnerId !== challenge.opponentId) {
      throw new Error('Invalid winner ID');
    }

    const winner = this.getUserById(winnerId);
    winner.addBalance(challenge.getTotalPot());

    challenge.status = ChallengeStatus.COMPLETED;
    challenge.completedAt = new Date();
    challenge.winnerId = winnerId;

    return challenge;
  }

  /**
   * Cancel a pending challenge
   */
  cancelChallenge(challengeId) {
    const challenge = this.getChallengeById(challengeId);
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new Error('Only pending challenges can be cancelled');
    }

    challenge.status = ChallengeStatus.CANCELLED;
    return challenge;
  }

  getChallengeById(id) {
    return this.challenges.find(c => c.id === id);
  }

  getAllChallenges() {
    return this.challenges.sort((a, b) => b.createdAt - a.createdAt);
  }

  getActiveChallenges() {
    return this.challenges.filter(c => c.isActive());
  }

  getPendingChallenges() {
    return this.challenges.filter(c => c.isPending());
  }

  getCompletedChallenges() {
    return this.challenges.filter(c => c.isCompleted());
  }
}

// Export singleton instance
export default new ChallengeService();
