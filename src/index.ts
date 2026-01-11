import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/users';
import betRoutes from './routes/bets';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', userRoutes);
app.use('/api', betRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'iBetcha Pre-Authorization Escrow API',
    version: '1.0.0',
    description: 'Credit card pre-authorization escrow system for betting platform',
    endpoints: {
      users: {
        'POST /api/users': 'Create a new user',
        'GET /api/users/:id': 'Get user by ID',
        'POST /api/users/:id/payment-methods': 'Add payment method to user',
        'GET /api/users': 'Get all users'
      },
      bets: {
        'POST /api/bets': 'Create a new bet with pre-authorization',
        'POST /api/bets/:id/join': 'Join a bet with pre-authorization',
        'POST /api/bets/:id/declare-winner': 'Declare winner and process payment',
        'POST /api/bets/:id/cancel': 'Cancel bet and release pre-authorizations',
        'GET /api/bets/:id': 'Get bet by ID',
        'GET /api/users/:userId/bets': 'Get all bets for a user',
        'GET /api/bets': 'Get all bets',
        'GET /api/bets/:id/transactions': 'Get transactions for a bet'
      },
      health: {
        'GET /health': 'Health check endpoint'
      }
    }
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  iBetcha Pre-Authorization Escrow API                     ║
║                                                           ║
║  Server running on port ${PORT}                              ║
║                                                           ║
║  Pre-Authorization Flow:                                  ║
║  1. Users enter their card information                    ║
║  2. App pre-authorizes (holds) the wager amount           ║
║  3. No money moves - funds are locked on their card       ║
║  4. When winner is declared:                              ║
║     - Loser's card is charged                             ║
║     - Winner receives payout from payment processor       ║
║     - You never touch the money                           ║
║                                                           ║
║  Benefits:                                                ║
║  ✓ Users cannot back out (funds reserved)                 ║
║  ✓ No regulatory risk (never hold the pot)                ║
║  ✓ Fair and automatic system                              ║
║  ✓ Payment processor handles everything                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
