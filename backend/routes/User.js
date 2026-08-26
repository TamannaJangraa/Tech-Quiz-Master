import express from 'express';
import { clerkWebhook } from '../controllers/webhook.js';

const router = express.Router();

// Webhook route - uses raw body parser (no clerk middleware here!)
router.post('/webhook', 
    express.raw({ type: 'application/json' }),
    clerkWebhook
);

export default router;
