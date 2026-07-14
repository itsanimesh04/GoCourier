import { Router } from 'express';
import { opsController } from '../controllers/ops/ops.controller';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';
import { validateRequest } from '../middleware/validateRequest';
import {
  getBatchDetailSchema,
  initiateRefundSchema,
  listRefundsSchema,
  markOrderItemConfirmedSchema,
  markOrderItemUnavailableSchema,
  updateProcurementTaskSchema
} from '../validators/ops.validators';

export const opsRouter = Router();

opsRouter.use(authenticate, authorizeRole('ops', 'admin'));

opsRouter.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok'
    }
  });
});

opsRouter.get('/batches/:id', validateRequest(getBatchDetailSchema), opsController.getBatchDetail);

opsRouter.post('/procurement-tasks/:id', validateRequest(updateProcurementTaskSchema), opsController.updateProcurementTask);
opsRouter.post('/order-items/:id/mark-unavailable', validateRequest(markOrderItemUnavailableSchema), opsController.markOrderItemUnavailable);
opsRouter.post('/order-items/:id/mark-confirmed', validateRequest(markOrderItemConfirmedSchema), opsController.markOrderItemConfirmed);
opsRouter.get('/refunds', validateRequest(listRefundsSchema), opsController.listRefunds);
opsRouter.post('/refunds/:id/initiate', validateRequest(initiateRefundSchema), opsController.initiateRefund);
