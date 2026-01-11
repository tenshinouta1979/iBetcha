/**
 * Challenge model representing a bet between two parties
 */
export class Challenge {
  constructor(
    id,
    creatorId,
    creatorName,
    opponentId,
    opponentName,
    description,
    condition,
    stake,
    status,
    createdAt,
    acceptedAt = null,
    completedAt = null,
    winnerId = null
  ) {
    this.id = id;
    this.creatorId = creatorId;
    this.creatorName = creatorName;
    this.opponentId = opponentId;
    this.opponentName = opponentName;
    this.description = description;
    this.condition = condition;
    this.stake = stake;
    this.status = status; // 'pending', 'accepted', 'locked', 'completed', 'cancelled'
    this.createdAt = createdAt;
    this.acceptedAt = acceptedAt;
    this.completedAt = completedAt;
    this.winnerId = winnerId;
  }

  getTotalPot() {
    return this.stake * 2;
  }

  isActive() {
    return this.status === 'accepted' || this.status === 'locked';
  }

  isPending() {
    return this.status === 'pending';
  }

  isCompleted() {
    return this.status === 'completed';
  }
}

export const ChallengeStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  LOCKED: 'locked',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};
