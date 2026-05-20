import { Router } from 'express'; 
import { signupUser } from './auth.controller';

const router = Router();

router.post('/signup', signupUser);

export const authRoutes = router;