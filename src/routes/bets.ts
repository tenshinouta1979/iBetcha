import { Router, Request, Response } from 'express';
import { betService } from '../services/BetService';
import { CreateBetRequest, JoinBetRequest, DeclareWinnerRequest } from '../types';
import { transactionStore } from '../models/Transaction';

const router = Router();

/**
 * Create a new bet with pre-authorization
 */
router.post('/bets', async (req: Request, res: Response): Promise<void> => {
  try {
    const request: CreateBetRequest = req.body;

    if (!request.creatorId || !request.description || !request.amount || !request.paymentMethodId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const bet = await betService.createBet(request);
    res.status(201).json({
      message: 'Bet created successfully. Funds have been pre-authorized on your card.',
      bet
    });
  } catch (error) {
    console.error('Error creating bet:', error);
    res.status(500).json({ error: `Failed to create bet: ${error}` });
  }
});

/**
 * Join a bet with pre-authorization
 */
router.post('/bets/:id/join', async (req: Request, res: Response): Promise<void> => {
  try {
    const betId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const request: JoinBetRequest = {
      betId,
      opponentId: req.body.opponentId,
      paymentMethodId: req.body.paymentMethodId
    };

    if (!request.opponentId || !request.paymentMethodId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const bet = await betService.joinBet(request);
    res.json({
      message: 'Bet joined successfully. Funds have been pre-authorized on your card.',
      bet
    });
  } catch (error) {
    console.error('Error joining bet:', error);
    res.status(500).json({ error: `Failed to join bet: ${error}` });
  }
});

/**
 * Declare winner and process payment
 */
router.post('/bets/:id/declare-winner', async (req: Request, res: Response): Promise<void> => {
  try {
    const betId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const request: DeclareWinnerRequest = {
      betId,
      winnerId: req.body.winnerId
    };

    if (!request.winnerId) {
      res.status(400).json({ error: 'Winner ID is required' });
      return;
    }

    const bet = await betService.declareWinner(request);
    res.json({
      message: 'Winner declared. Loser has been charged and winner\'s hold has been released.',
      bet
    });
  } catch (error) {
    console.error('Error declaring winner:', error);
    res.status(500).json({ error: `Failed to declare winner: ${error}` });
  }
});

/**
 * Cancel a bet and release pre-authorizations
 */
router.post('/bets/:id/cancel', async (req: Request, res: Response): Promise<void> => {
  try {
    const betId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const bet = await betService.cancelBet(betId);
    res.json({
      message: 'Bet cancelled. All pre-authorizations have been released.',
      bet
    });
  } catch (error) {
    console.error('Error cancelling bet:', error);
    res.status(500).json({ error: `Failed to cancel bet: ${error}` });
  }
});

/**
 * Get bet by ID
 */
router.get('/bets/:id', (req: Request, res: Response): void => {
  const betId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const bet = betService.getBet(betId);
  if (!bet) {
    res.status(404).json({ error: 'Bet not found' });
    return;
  }
  res.json(bet);
});

/**
 * Get all bets for a user
 */
router.get('/users/:userId/bets', (req: Request, res: Response): void => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const bets = betService.getUserBets(userId);
  res.json(bets);
});

/**
 * Get all bets
 */
router.get('/bets', (req: Request, res: Response): void => {
  const bets = betService.getAllBets();
  res.json(bets);
});

/**
 * Get transactions for a bet
 */
router.get('/bets/:id/transactions', (req: Request, res: Response): void => {
  const betId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const transactions = transactionStore.findByBetId(betId);
  res.json(transactions);
});

export default router;
