import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

export const webhookRouter = Router();

webhookRouter.post('/payment', webhookController.payment);
webhookRouter.post('/refund', webhookController.refund);

