import { User } from '../src/models/User';

describe('User Model', () => {
  let user;

  beforeEach(() => {
    user = new User('1', 'Alice', 1000);
  });

  test('should create a user with correct properties', () => {
    expect(user.id).toBe('1');
    expect(user.name).toBe('Alice');
    expect(user.balance).toBe(1000);
  });

  test('should check if user can afford amount', () => {
    expect(user.canAfford(500)).toBe(true);
    expect(user.canAfford(1000)).toBe(true);
    expect(user.canAfford(1001)).toBe(false);
  });

  test('should deduct balance correctly', () => {
    const success = user.deductBalance(300);
    expect(success).toBe(true);
    expect(user.balance).toBe(700);
  });

  test('should not deduct balance if insufficient funds', () => {
    const success = user.deductBalance(1500);
    expect(success).toBe(false);
    expect(user.balance).toBe(1000);
  });

  test('should add balance correctly', () => {
    user.addBalance(500);
    expect(user.balance).toBe(1500);
  });
});
