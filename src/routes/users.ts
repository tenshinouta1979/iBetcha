import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';
import { userStore } from '../models/User';
import { getPaymentService } from '../services/PaymentService';

const router = Router();

/**
 * Create a new user
 */
router.post('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    // Create Stripe customer
    const paymentService = getPaymentService();
    const userId = uuidv4();
    const stripeCustomerId = await paymentService.createCustomer(userId, email, name);

    // Create user
    const user: User = {
      id: userId,
      name,
      email,
      stripeCustomerId,
      createdAt: new Date()
    };

    const createdUser = userStore.create(user);
    res.status(201).json(createdUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * Get user by ID
 */
router.get('/users/:id', (req: Request, res: Response): void => {
  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = userStore.findById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

/**
 * Add payment method to user
 */
router.post('/users/:id/payment-methods', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      res.status(400).json({ error: 'Payment method ID is required' });
      return;
    }

    const user = userStore.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.stripeCustomerId) {
      res.status(400).json({ error: 'User does not have a Stripe customer ID' });
      return;
    }

    // Attach payment method to customer
    const paymentService = getPaymentService();
    await paymentService.attachPaymentMethod(user.stripeCustomerId, paymentMethodId);

    // Get payment method details
    const paymentMethod = await paymentService.getPaymentMethod(paymentMethodId);

    // Update user
    userStore.update(userId, {
      paymentMethodId
    });

    res.json({
      message: 'Payment method added successfully',
      paymentMethod: {
        id: paymentMethod.id,
        brand: paymentMethod.card?.brand,
        last4: paymentMethod.card?.last4
      }
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
});

/**
 * Get all users
 */
router.get('/users', (req: Request, res: Response): void => {
  const users = userStore.findAll();
  res.json(users);
});

export default router;
