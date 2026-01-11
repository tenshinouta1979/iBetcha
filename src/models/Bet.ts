import { Bet } from '../types';

/**
 * In-memory bet store
 * In production, this would be replaced with a database
 */
class BetStore {
  private bets: Map<string, Bet> = new Map();

  create(bet: Bet): Bet {
    this.bets.set(bet.id, bet);
    return bet;
  }

  findById(id: string): Bet | undefined {
    return this.bets.get(id);
  }

  update(id: string, updates: Partial<Bet>): Bet | undefined {
    const bet = this.bets.get(id);
    if (!bet) return undefined;

    const updated = { ...bet, ...updates };
    this.bets.set(id, updated);
    return updated;
  }

  findByUserId(userId: string): Bet[] {
    return Array.from(this.bets.values()).filter(
      bet => bet.creatorId === userId || bet.opponentId === userId
    );
  }

  findAll(): Bet[] {
    return Array.from(this.bets.values());
  }
}

export const betStore = new BetStore();
