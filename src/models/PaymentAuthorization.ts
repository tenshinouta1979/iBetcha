import { PaymentAuthorization } from '../types';

/**
 * In-memory payment authorization store
 * In production, this would be replaced with a database
 */
class PaymentAuthorizationStore {
  private authorizations: Map<string, PaymentAuthorization> = new Map();

  create(authorization: PaymentAuthorization): PaymentAuthorization {
    this.authorizations.set(authorization.id, authorization);
    return authorization;
  }

  findById(id: string): PaymentAuthorization | undefined {
    return this.authorizations.get(id);
  }

  update(id: string, updates: Partial<PaymentAuthorization>): PaymentAuthorization | undefined {
    const authorization = this.authorizations.get(id);
    if (!authorization) return undefined;

    const updated = { ...authorization, ...updates };
    this.authorizations.set(id, updated);
    return updated;
  }

  findByBetId(betId: string): PaymentAuthorization[] {
    return Array.from(this.authorizations.values()).filter(
      auth => auth.betId === betId
    );
  }

  findAll(): PaymentAuthorization[] {
    return Array.from(this.authorizations.values());
  }
}

export const paymentAuthorizationStore = new PaymentAuthorizationStore();
