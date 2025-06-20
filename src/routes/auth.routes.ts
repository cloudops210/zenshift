import { Router } from 'express';
import { register, login, socialAuthCallback } from '../controllers/auth.controller';
import passport from '../config/passport';

const router = Router();

router.post('/register', register);

router.post('/login', login);

// Google authentication routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), socialAuthCallback);

// Facebook authentication routes
// router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
// router.get("/facebook/callback", passport.authenticate("facebook", { session: false }), socialAuthCallback);

export default router;
