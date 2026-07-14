import { Router } from 'express';
import { deliveryController } from '../controllers/delivery/delivery.controller';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';
import { validateRequest } from '../middleware/validateRequest';
import {
  deliverOrderSchema,
  getDeliveryBatchByIdSchema,
  getMyBatchesSchema,
  markNotDeliveredSchema,
  startBatchSchema
} from '../validators/delivery.validators';

export const deliveryRouter = Router();

deliveryRouter.use(authenticate, authorizeRole('delivery_agent', 'admin'));

deliveryRouter.get('/my-batches', validateRequest(getMyBatchesSchema), deliveryController.getMyBatches);
deliveryRouter.get('/batches/:id', validateRequest(getDeliveryBatchByIdSchema), deliveryController.getBatchById);
deliveryRouter.post('/batches/:id/start', validateRequest(startBatchSchema), deliveryController.startBatch);
deliveryRouter.post('/orders/:id/deliver', validateRequest(deliverOrderSchema), deliveryController.deliverOrder);
deliveryRouter.post('/orders/:id/not-delivered', validateRequest(markNotDeliveredSchema), deliveryController.markNotDelivered);
