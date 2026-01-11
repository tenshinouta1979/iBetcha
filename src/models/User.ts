import { User } from '../types';

/**
 * In-memory user store
 * In production, this would be replaced with a database
 */
class UserStore {
  private users: Map<string, User> = new Map();

  create(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  update(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }
}

export const userStore = new UserStore();
