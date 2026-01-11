import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { AuthorizationStatus, PaymentAuthorization } from '../types';
import { paymentAuthorizationStore } from '../models/PaymentAuthorization';

/**
 * Payment Service for handling credit card pre-authorizations
 * 
 * This service implements the pre-authorization escrow pattern:
 * 1. Pre-authorize (hold) funds on user's card without charging
 * 2. Capture (charge) the loser's card when winner is declared
 * 3. Release (void) holds when bet is cancelled
 * 4. Transfer funds to winner
 * 
 * Uses Stripe Payment Intents with manual capture for pre-authorization
 */
export class PaymentService {
  private stripe: Stripe;

  constructor(stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover'
    });
  }

  /**
   * Pre-authorize (hold) funds on a user's payment method
   * This locks the funds without charging them
   */
  async preAuthorize(
    customerId: string,
    paymentMethodId: string,
    amount: number,
    betId: string,
    userId: string
  ): Promise<PaymentAuthorization> {
    try {
      // Create a Payment Intent with manual capture
      // This holds the funds without charging them immediately
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        capture_method: 'manual', // Key setting for pre-authorization
        metadata: {
          betId,
          userId,
          type: 'bet_authorization'
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        }
      });

      // Create authorization record
      const authorization: PaymentAuthorization = {
        id: uuidv4(),
        betId,
        userId,
        amount,
        stripePaymentIntentId: paymentIntent.id,
        status: AuthorizationStatus.AUTHORIZED,
        createdAt: new Date()
      };

      return paymentAuthorizationStore.create(authorization);
    } catch (error) {
      console.error('Pre-authorization failed:', error);
      
      // Create failed authorization record
      const authorization: PaymentAuthorization = {
        id: uuidv4(),
        betId,
        userId,
        amount,
        stripePaymentIntentId: '',
        status: AuthorizationStatus.FAILED,
        createdAt: new Date()
      };

      paymentAuthorizationStore.create(authorization);
      throw new Error(`Failed to pre-authorize payment: ${error}`);
    }
  }

  /**
   * Capture (charge) the pre-authorized funds
   * Used to charge the loser when winner is declared
   */
  async capture(authorizationId: string): Promise<void> {
    const authorization = paymentAuthorizationStore.findById(authorizationId);
    
    if (!authorization) {
      throw new Error('Authorization not found');
    }

    if (authorization.status !== AuthorizationStatus.AUTHORIZED) {
      throw new Error(`Cannot capture authorization with status: ${authorization.status}`);
    }

    try {
      // Capture the payment intent to charge the card
      await this.stripe.paymentIntents.capture(authorization.stripePaymentIntentId);

      // Update authorization status
      paymentAuthorizationStore.update(authorizationId, {
        status: AuthorizationStatus.CAPTURED,
        capturedAt: new Date()
      });
    } catch (error) {
      console.error('Capture failed:', error);
      throw new Error(`Failed to capture payment: ${error}`);
    }
  }

  /**
   * Release (void) the pre-authorization
   * Used when bet is cancelled or expires
   */
  async release(authorizationId: string): Promise<void> {
    const authorization = paymentAuthorizationStore.findById(authorizationId);
    
    if (!authorization) {
      throw new Error('Authorization not found');
    }

    if (authorization.status !== AuthorizationStatus.AUTHORIZED) {
      throw new Error(`Cannot release authorization with status: ${authorization.status}`);
    }

    try {
      // Cancel the payment intent to release the hold
      await this.stripe.paymentIntents.cancel(authorization.stripePaymentIntentId);

      // Update authorization status
      paymentAuthorizationStore.update(authorizationId, {
        status: AuthorizationStatus.RELEASED,
        releasedAt: new Date()
      });
    } catch (error) {
      console.error('Release failed:', error);
      throw new Error(`Failed to release authorization: ${error}`);
    }
  }

  /**
   * Create a Stripe customer for a user
   */
  async createCustomer(userId: string, email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: {
        userId
      }
    });

    return customer.id;
  }

  /**
   * Attach a payment method to a customer
   */
  async attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });
  }

  /**
   * Get payment method details
   */
  async getPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    return await this.stripe.paymentMethods.retrieve(paymentMethodId);
  }
}

// Singleton instance
let paymentService: PaymentService | null = null;

export function getPaymentService(): PaymentService {
  if (!paymentService) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    paymentService = new PaymentService(stripeKey);
  }
  return paymentService;
}
