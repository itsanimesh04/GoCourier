import { Router } from 'express';
import { adminRouter } from './admin.routes';
import { authRouter } from './auth.routes';
import { customerRouter } from './customer.routes';
import { deliveryRouter } from './delivery.routes';
import { opsRouter } from './ops.routes';
import { webhookRouter } from './webhook.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/webhooks', webhookRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/ops', opsRouter);
apiRouter.use('/delivery', deliveryRouter);
apiRouter.use(customerRouter);
