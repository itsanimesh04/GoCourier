import { Router } from 'express';
import { campusController } from '../controllers/admin/campus.controller';
import { menuItemController } from '../controllers/admin/menu-item.controller';
import { restaurantController } from '../controllers/admin/restaurant.controller';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';
import { validateRequest } from '../middleware/validateRequest';
import {
  createCampusSchema,
  createMenuItemSchema,
  createRestaurantSchema,
  updateCampusSchema,
  updateMenuItemSchema,
  updateRestaurantSchema
} from '../validators/admin.validators';

export const adminRouter = Router();

adminRouter.use(authenticate, authorizeRole('admin'));

adminRouter.post('/campuses', validateRequest(createCampusSchema), campusController.create);
adminRouter.patch('/campuses/:id', validateRequest(updateCampusSchema), campusController.update);

adminRouter.post('/restaurants', validateRequest(createRestaurantSchema), restaurantController.create);
adminRouter.patch('/restaurants/:id', validateRequest(updateRestaurantSchema), restaurantController.update);

adminRouter.post('/restaurants/:id/menu-items', validateRequest(createMenuItemSchema), menuItemController.create);
adminRouter.patch('/menu-items/:id', validateRequest(updateMenuItemSchema), menuItemController.update);
