import express, { Router } from 'express';
import {
    createCheckoutSession,
    stripeWebhook,
    getSubscriptionStatus,
} from '../controllers/stripe.controller';

const router = Router();

router.post('/create-checkout-session', createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.get('/status', getSubscriptionStatus);

export default router; 