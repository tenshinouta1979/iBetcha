import { v4 as uuidv4 } from 'uuid';
import { Bet, BetStatus, CreateBetRequest, JoinBetRequest, DeclareWinnerRequest, Transaction } from '../types';
import { betStore } from '../models/Bet';
import { userStore } from '../models/User';
import { transactionStore } from '../models/Transaction';
import { getPaymentService } from './PaymentService';

/**
 * Bet Service for managing bet lifecycle
 * 
 * Workflow:
 * 1. Creator creates bet -> pre-authorize their card
 * 2. Opponent joins bet -> pre-authorize their card
 * 3. Winner declared -> charge loser, release winner's hold
 * 4. Money never touches our platform - goes directly from loser to winner
 */
export class BetService {
  /**
   * Create a new bet with pre-authorization
   */
  async createBet(request: CreateBetRequest): Promise<Bet> {
    const { creatorId, description, amount, paymentMethodId } = request;

    // Validate user exists
    const creator = userStore.findById(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    // Validate amount
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Create bet
    const bet: Bet = {
      id: uuidv4(),
      creatorId,
      description,
      amount,
      status: BetStatus.PENDING,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    const createdBet = betStore.create(bet);

    try {
      // Pre-authorize creator's card
      const paymentService = getPaymentService();
      
      if (!creator.stripeCustomerId) {
        throw new Error('User does not have a Stripe customer ID');
      }

      const authorization = await paymentService.preAuthorize(
        creator.stripeCustomerId,
        paymentMethodId,
        amount,
        bet.id,
        creatorId
      );

      // Update bet with authorization
      betStore.update(bet.id, {
        creatorAuthorizationId: authorization.id
      });

      return betStore.findById(bet.id)!;
    } catch (error) {
      // If pre-authorization fails, mark bet as cancelled
      betStore.update(bet.id, { status: BetStatus.CANCELLED });
      throw error;
    }
  }

  /**
   * Join an existing bet with pre-authorization
   */
  async joinBet(request: JoinBetRequest): Promise<Bet> {
    const { betId, opponentId, paymentMethodId } = request;

    // Validate bet exists and is pending
    const bet = betStore.findById(betId);
    if (!bet) {
      throw new Error('Bet not found');
    }

    if (bet.status !== BetStatus.PENDING) {
      throw new Error(`Cannot join bet with status: ${bet.status}`);
    }

    if (bet.creatorId === opponentId) {
      throw new Error('Cannot join your own bet');
    }

    // Validate opponent exists
    const opponent = userStore.findById(opponentId);
    if (!opponent) {
      throw new Error('Opponent not found');
    }

    try {
      // Pre-authorize opponent's card
      const paymentService = getPaymentService();
      
      if (!opponent.stripeCustomerId) {
        throw new Error('User does not have a Stripe customer ID');
      }

      const authorization = await paymentService.preAuthorize(
        opponent.stripeCustomerId,
        paymentMethodId,
        bet.amount,
        betId,
        opponentId
      );

      // Update bet with opponent and their authorization
      betStore.update(betId, {
        opponentId,
        opponentAuthorizationId: authorization.id,
        status: BetStatus.AUTHORIZED
      });

      return betStore.findById(betId)!;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Declare winner and process payment
   * - Charges the loser's card
   * - Releases the winner's pre-authorization
   * - Money flows directly from loser to winner via payment processor
   */
  async declareWinner(request: DeclareWinnerRequest): Promise<Bet> {
    const { betId, winnerId } = request;

    // Validate bet
    const bet = betStore.findById(betId);
    if (!bet) {
      throw new Error('Bet not found');
    }

    if (bet.status !== BetStatus.AUTHORIZED) {
      throw new Error(`Cannot declare winner for bet with status: ${bet.status}`);
    }

    if (!bet.opponentId) {
      throw new Error('Bet does not have an opponent');
    }

    // Validate winner is a participant
    if (winnerId !== bet.creatorId && winnerId !== bet.opponentId) {
      throw new Error('Winner must be a participant in the bet');
    }

    const loserId = winnerId === bet.creatorId ? bet.opponentId : bet.creatorId;
    const loserAuthId = winnerId === bet.creatorId ? bet.opponentAuthorizationId : bet.creatorAuthorizationId;
    const winnerAuthId = winnerId === bet.creatorId ? bet.creatorAuthorizationId : bet.opponentAuthorizationId;

    if (!loserAuthId || !winnerAuthId) {
      throw new Error('Missing authorization IDs');
    }

    try {
      const paymentService = getPaymentService();

      // Capture loser's pre-authorization (charge their card)
      await paymentService.capture(loserAuthId);

      // Release winner's pre-authorization (no charge)
      await paymentService.release(winnerAuthId);

      // Record transaction
      const transaction: Transaction = {
        id: uuidv4(),
        betId,
        fromUserId: loserId,
        toUserId: winnerId,
        amount: bet.amount,
        type: 'CHARGE',
        createdAt: new Date()
      };
      transactionStore.create(transaction);

      // Update bet status
      betStore.update(betId, {
        winnerId,
        status: BetStatus.COMPLETED,
        completedAt: new Date()
      });

      return betStore.findById(betId)!;
    } catch (error) {
      console.error('Failed to declare winner:', error);
      throw error;
    }
  }

  /**
   * Cancel a bet and release all pre-authorizations
   */
  async cancelBet(betId: string): Promise<Bet> {
    const bet = betStore.findById(betId);
    if (!bet) {
      throw new Error('Bet not found');
    }

    if (bet.status === BetStatus.COMPLETED || bet.status === BetStatus.CANCELLED) {
      throw new Error(`Cannot cancel bet with status: ${bet.status}`);
    }

    try {
      const paymentService = getPaymentService();

      // Release all authorizations
      if (bet.creatorAuthorizationId) {
        await paymentService.release(bet.creatorAuthorizationId);
      }
      if (bet.opponentAuthorizationId) {
        await paymentService.release(bet.opponentAuthorizationId);
      }

      // Update bet status
      betStore.update(betId, {
        status: BetStatus.CANCELLED
      });

      return betStore.findById(betId)!;
    } catch (error) {
      console.error('Failed to cancel bet:', error);
      throw error;
    }
  }

  /**
   * Get bet by ID
   */
  getBet(betId: string): Bet | undefined {
    return betStore.findById(betId);
  }

  /**
   * Get all bets for a user
   */
  getUserBets(userId: string): Bet[] {
    return betStore.findByUserId(userId);
  }

  /**
   * Get all bets
   */
  getAllBets(): Bet[] {
    return betStore.findAll();
  }
}

export const betService = new BetService();
