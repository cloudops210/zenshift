import { Request, Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User';

function cleanEnvVar(val: string | undefined) {
  if (!val) return val;
  return val.replace(/^['"]|['"]$/g, '');
}

const STRIPE_SECRET_KEY = cleanEnvVar(process.env.STRIPE_SECRET_KEY);
const BASIC_PRICE_ID = cleanEnvVar(process.env.STRIPE_BASIC_PRICE_ID);
const PREMIUM_PRICE_ID = cleanEnvVar(process.env.STRIPE_PREMIUM_PRICE_ID);
const STRIPE_WEBHOOK_SECRET = cleanEnvVar(process.env.STRIPE_WEBHOOK_SECRET);

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
}
if (!STRIPE_WEBHOOK_SECRET) {
  console.warn('[Stripe] WARNING: STRIPE_WEBHOOK_SECRET is not set. Webhook validation will fail!');
}
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' });

const FRONTEND_URL = 'https://zenshift.com';

function ensureAbsoluteUrl(url: string) {
  if (!/^https?:\/\//.test(url)) {
    return 'http://' + url;
  }
  return url;
}

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { plan, userId } = req.body as { plan: 'basic' | 'premium'; userId: string };
    if (!['basic', 'premium'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan.' });
    }
    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Create Stripe customer if not exists
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: String(user._id) },
      });
      customerId = customer.id;
      user.subscription = user.subscription || {};
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Select price ID
    let priceId: string | undefined;
    if (plan === 'basic') priceId = BASIC_PRICE_ID;
    else if (plan === 'premium') priceId = PREMIUM_PRICE_ID;
    if (!priceId) {
      return res.status(500).json({ message: 'Stripe price ID is not set correctly in environment variables.' });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: ensureAbsoluteUrl(`${FRONTEND_URL}/dashboard?success=true`),
      cancel_url: ensureAbsoluteUrl(`${FRONTEND_URL}/dashboard?canceled=true`),
    });
    res.json({ url: session.url });
  } catch (err: any) {
    console.error('[Stripe] Error in createCheckoutSession:', err);
    res.status(500).json({ message: 'Stripe error', error: err.message, details: err });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  console.log('[Stripe] Received webhook event');
  const sig = req.headers['stripe-signature'] as string;
  
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe] Webhook secret not configured!');
    return res.status(400).send('Webhook secret not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    console.log('[Stripe] Webhook event type:', event.type);
  } catch (err: any) {
    console.error('[Stripe] Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    console.log('[Stripe] Processing subscription event for customer:', customerId);
    
    const user = await User.findOne({ 'subscription.stripeCustomerId': customerId }).exec();
    if (user) {
      const oldStatus = user.subscription?.status;
      const oldPlan = user.subscription?.plan;
      
      // Update subscription status
      user.subscription = user.subscription || {};
      user.subscription.status = subscription.status === 'active' ? 'active' : 'inactive';
      user.subscription.stripeSubscriptionId = subscription.id;
      
      // Get the price ID from the subscription
      const subscriptionPriceId = subscription.items.data[0].price.id;
      console.log('[Stripe] Price ID from subscription:', subscriptionPriceId);
      console.log('[Stripe] Comparing with Basic:', BASIC_PRICE_ID, 'Premium:', PREMIUM_PRICE_ID);
      
      // Determine plan type
      if (subscriptionPriceId === BASIC_PRICE_ID) {
        user.subscription.plan = 'basic';
      } else if (subscriptionPriceId === PREMIUM_PRICE_ID) {
        user.subscription.plan = 'premium';
      } else {
        console.error('[Stripe] Unknown price ID:', subscriptionPriceId);
      }
      
      await user.save();
      console.log('[Stripe] Updated user subscription:', {
        userId: user._id,
        oldStatus,
        newStatus: user.subscription.status,
        oldPlan,
        newPlan: user.subscription.plan
      });
    } else {
      console.error('[Stripe] User not found for customer:', customerId);
    }
  }
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    console.log('[Stripe] Processing subscription deletion for customer:', customerId);
    
    const user = await User.findOne({ 'subscription.stripeCustomerId': customerId }).exec();
    if (user) {
      user.subscription = user.subscription || {};
      user.subscription.status = 'canceled';
      await user.save();
      console.log('[Stripe] Marked subscription as canceled for user:', user._id);
    } else {
      console.error('[Stripe] User not found for customer:', customerId);
    }
  }
  res.json({ received: true });
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ subscription: user.subscription });
  } catch (err: any) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 