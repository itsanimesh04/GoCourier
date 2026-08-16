import { Router, type RequestHandler } from 'express';
import { uploadController } from '../controllers/admin/upload.controller';
import { cartController } from '../controllers/customer/cart.controller';
import { customerCampusController } from '../controllers/customer/campus.controller';
import { customerCatalogController } from '../controllers/customer/catalog.controller';
import { customerOrderController } from '../controllers/customer/order.controller';
import { customerRestaurantController } from '../controllers/customer/restaurant.controller';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';
import { validateRequest } from '../middleware/validateRequest';
import { uploadImage } from '../middleware/upload';
import { idParamsSchema } from '../validators/common.validators';
import {
  createCartSchema,
  createOrderSchema,
  listExtrasSchema,
  listOrdersSchema,
  listRestaurantsSchema,
  restaurantIdSchema,
  setCampusSchema
} from '../validators/customer.validators';

export const customerRouter = Router();

const studentOnly: RequestHandler[] = [authenticate, authorizeRole('student')];

customerRouter.get('/campuses', customerCampusController.list);
customerRouter.get('/banners', customerCatalogController.banners);
customerRouter.get('/categories', customerCatalogController.categories);
customerRouter.get('/config', customerCatalogController.config);
customerRouter.get(
  '/extras-products',
  validateRequest(listExtrasSchema),
  customerCatalogController.extras
);
customerRouter.get('/restaurants', validateRequest(listRestaurantsSchema), customerRestaurantController.list);
customerRouter.get(
  '/restaurants/:id',
  validateRequest(restaurantIdSchema),
  customerRestaurantController.getById
);
customerRouter.get(
  '/restaurants/:id/menu',
  validateRequest(restaurantIdSchema),
  customerRestaurantController.menu
);
customerRouter.get('/menu-items/:id', validateRequest(idParamsSchema), customerRestaurantController.menuItem);

customerRouter.post('/me/campus', ...studentOnly, validateRequest(setCampusSchema), customerCampusController.setDefault);
customerRouter.post('/cart', ...studentOnly, validateRequest(createCartSchema), cartController.create);
customerRouter.get('/cart', ...studentOnly, cartController.get);
customerRouter.get('/orders', ...studentOnly, validateRequest(listOrdersSchema), customerOrderController.list);
customerRouter.get('/orders/:id', ...studentOnly, validateRequest(idParamsSchema), customerOrderController.detail);
customerRouter.post('/orders', ...studentOnly, validateRequest(createOrderSchema), customerOrderController.create);
customerRouter.post('/orders/:id/pay', ...studentOnly, validateRequest(idParamsSchema), customerOrderController.pay);
customerRouter.post('/uploads', ...studentOnly, uploadImage.single('file'), uploadController.upload);
