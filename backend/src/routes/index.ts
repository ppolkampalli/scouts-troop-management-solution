import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import troopRoutes from './troop.routes';
import scoutRoutes from './scout.routes';

const router = Router();

// Route mounting
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/troops', troopRoutes);
router.use('/scouts', scoutRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Scout Troop Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      users: '/users',
      troops: '/troops',
      scouts: '/scouts'
    },
    documentation: {
      health: '/health',
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        profile: 'GET /auth/profile',
        refreshToken: 'POST /auth/refresh-token'
      },
      users: {
        getAll: 'GET /users',
        getById: 'GET /users/:id',
        dashboard: 'GET /users/dashboard'
      },
      troops: {
        getAll: 'GET /troops',
        getById: 'GET /troops/:id',
        create: 'POST /troops',
        getMyTroops: 'GET /troops/my/troops'
      },
      scouts: {
        getScouts: 'GET /scouts',
        getMyScouts: 'GET /scouts/my',
        create: 'POST /scouts',
        meritBadges: 'GET /scouts/merit-badges/catalog'
      }
    }
  });
});

export default router;