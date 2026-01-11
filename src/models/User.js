/**
 * User model representing a participant in challenges
 */
export class User {
  constructor(id, name, balance = 1000) {
    this.id = id;
    this.name = name;
    this.balance = balance;
  }

  canAfford(amount) {
    return this.balance >= amount;
  }

  deductBalance(amount) {
    if (this.canAfford(amount)) {
      this.balance -= amount;
      return true;
    }
    return false;
  }

  addBalance(amount) {
    this.balance += amount;
  }
}
