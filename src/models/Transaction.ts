import { Transaction } from '../types';

/**
 * In-memory transaction store
 * In production, this would be replaced with a database
 */
class TransactionStore {
  private transactions: Map<string, Transaction> = new Map();

  create(transaction: Transaction): Transaction {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  findById(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  findByBetId(betId: string): Transaction[] {
    return Array.from(this.transactions.values()).filter(
      tx => tx.betId === betId
    );
  }

  findByUserId(userId: string): Transaction[] {
    return Array.from(this.transactions.values()).filter(
      tx => tx.fromUserId === userId || tx.toUserId === userId
    );
  }

  findAll(): Transaction[] {
    return Array.from(this.transactions.values());
  }
}

export const transactionStore = new TransactionStore();
