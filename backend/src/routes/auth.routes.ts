import { Router } from 'express';
import { login, me } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/auth/login', login);
router.get('/auth/me', requireAuth, me);

export default router;
