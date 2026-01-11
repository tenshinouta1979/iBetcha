/**
 * Core type definitions for the iBetcha pre-authorization escrow system
 */

export enum BetStatus {
  PENDING = 'PENDING',           // Bet created, waiting for opponent
  AUTHORIZED = 'AUTHORIZED',     // Both parties authorized, funds held
  COMPLETED = 'COMPLETED',       // Winner declared, funds transferred
  CANCELLED = 'CANCELLED',       // Bet cancelled, holds released
  EXPIRED = 'EXPIRED'            // Bet expired without completion
}

export enum AuthorizationStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',         // Funds charged
  RELEASED = 'RELEASED',         // Hold released/voided
  FAILED = 'FAILED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  stripeCustomerId?: string;
  paymentMethodId?: string;
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  last4: string;
  brand: string;
  createdAt: Date;
}

export interface Bet {
  id: string;
  creatorId: string;
  opponentId?: string;
  description: string;
  amount: number;                // Amount in cents
  status: BetStatus;
  creatorAuthorizationId?: string;
  opponentAuthorizationId?: string;
  winnerId?: string;
  createdAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
}

export interface PaymentAuthorization {
  id: string;
  betId: string;
  userId: string;
  amount: number;
  stripePaymentIntentId: string;
  status: AuthorizationStatus;
  createdAt: Date;
  capturedAt?: Date;
  releasedAt?: Date;
}

export interface Transaction {
  id: string;
  betId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: 'CHARGE' | 'PAYOUT';
  stripeChargeId?: string;
  stripeTransferId?: string;
  createdAt: Date;
}

export interface CreateBetRequest {
  creatorId: string;
  description: string;
  amount: number;
  paymentMethodId: string;
}

export interface JoinBetRequest {
  betId: string;
  opponentId: string;
  paymentMethodId: string;
}

export interface DeclareWinnerRequest {
  betId: string;
  winnerId: string;
}
