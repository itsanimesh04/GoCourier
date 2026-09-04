import { Router } from 'express';
import { adminAuthController } from '../controllers/admin/auth.controller';
import { campusController } from '../controllers/admin/campus.controller';
import { restaurantController } from '../controllers/admin/restaurant.controller';
import { menuItemController } from '../controllers/admin/menu-item.controller';
import { categoryController } from '../controllers/admin/category.controller';
import { bannerController } from '../controllers/admin/banner.controller';
import { adminUserController } from '../controllers/admin/user.controller';
import { adminOrderController } from '../controllers/admin/order.controller';
import { adminPaymentController } from '../controllers/admin/payment.controller';
import { revenueController } from '../controllers/admin/revenue.controller';
import { dashboardController } from '../controllers/admin/dashboard.controller';
import { adminConfigController } from '../controllers/admin/config.controller';
import { extraProductController } from '../controllers/admin/extra-product.controller';
import { uploadController } from '../controllers/admin/upload.controller';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';
import { validateRequest } from '../middleware/validateRequest';
import { uploadImage } from '../middleware/upload';
import {
  adminLoginSchema,
  addonGroupIdSchema,
  bannerIdSchema,
  campusIdSchema,
  categoryIdSchema,
  createAddonGroupSchema,
  createAddonSchema,
  createBannerSchema,
  createCampusSchema,
  createCategorySchema,
  createExtraProductSchema,
  createMenuItemSchema,
  createOptionSetSchema,
  createRestaurantSchema,
  deleteUploadSchema,
  extraProductIdSchema,
  menuItemIdSchema,
  optionSetIdSchema,
  orderIdSchema,
  paymentIdSchema,
  restaurantIdSchema,
  updateAddonGroupSchema,
  updateAddonSchema,
  updateBannerSchema,
  updateCampusSchema,
  updateCategorySchema,
  updateConfigSchema,
  updateExtraProductSchema,
  updateMenuItemSchema,
  updateOptionSetSchema,
  updateOrderStatusSchema,
  updateRestaurantSchema,
  updateUserSchema,
  userIdSchema
} from '../validators/admin.validators';
import { addonGroupController } from '../controllers/admin/addon-group.controller';
import { optionSetController } from '../controllers/admin/option-set.controller';

export const adminRouter = Router();

adminRouter.post('/login', validateRequest(adminLoginSchema), adminAuthController.login);
adminRouter.post('/logout', adminAuthController.logout);

adminRouter.use(authenticate, authorizeRole('admin'));

adminRouter.get('/identity', adminAuthController.identity);

adminRouter.get('/dashboard/stats', dashboardController.stats);
adminRouter.get('/revenue/summary', revenueController.summary);

adminRouter.get('/campuses', campusController.list);
adminRouter.get('/campuses/:id', validateRequest(campusIdSchema), campusController.getById);
adminRouter.post('/campuses', validateRequest(createCampusSchema), campusController.create);
adminRouter.patch('/campuses/:id', validateRequest(updateCampusSchema), campusController.update);
adminRouter.delete('/campuses/:id', validateRequest(campusIdSchema), campusController.remove);

adminRouter.get('/restaurants', restaurantController.list);
adminRouter.get('/restaurants/:id', validateRequest(restaurantIdSchema), restaurantController.getById);
adminRouter.post('/restaurants', validateRequest(createRestaurantSchema), restaurantController.create);
adminRouter.patch(
  '/restaurants/:id',
  validateRequest(updateRestaurantSchema),
  restaurantController.update
);
adminRouter.delete(
  '/restaurants/:id',
  validateRequest(restaurantIdSchema),
  restaurantController.remove
);

adminRouter.get('/menu-items', menuItemController.list);
adminRouter.get('/menu-items/:id', validateRequest(menuItemIdSchema), menuItemController.getById);
adminRouter.post(
  '/restaurants/:id/menu-items',
  validateRequest(createMenuItemSchema),
  menuItemController.create
);
adminRouter.patch('/menu-items/:id', validateRequest(updateMenuItemSchema), menuItemController.update);
adminRouter.delete('/menu-items/:id', validateRequest(menuItemIdSchema), menuItemController.remove);

adminRouter.get('/addons', menuItemController.listAddons);
adminRouter.post('/addons', validateRequest(createAddonSchema), menuItemController.createAddon);
adminRouter.patch('/addons/:id', validateRequest(updateAddonSchema), menuItemController.updateAddon);

adminRouter.get('/addon-groups', addonGroupController.list);
adminRouter.get('/addon-groups/:id', validateRequest(addonGroupIdSchema), addonGroupController.getById);
adminRouter.post(
  '/addon-groups',
  validateRequest(createAddonGroupSchema),
  addonGroupController.create
);
adminRouter.patch(
  '/addon-groups/:id',
  validateRequest(updateAddonGroupSchema),
  addonGroupController.update
);
adminRouter.delete(
  '/addon-groups/:id',
  validateRequest(addonGroupIdSchema),
  addonGroupController.remove
);

adminRouter.get('/option-sets', optionSetController.list);
adminRouter.get('/option-sets/:id', validateRequest(optionSetIdSchema), optionSetController.getById);
adminRouter.post('/option-sets', validateRequest(createOptionSetSchema), optionSetController.create);
adminRouter.patch(
  '/option-sets/:id',
  validateRequest(updateOptionSetSchema),
  optionSetController.update
);
adminRouter.delete('/option-sets/:id', validateRequest(optionSetIdSchema), optionSetController.remove);

adminRouter.get('/categories', categoryController.list);
adminRouter.get('/categories/:id', validateRequest(categoryIdSchema), categoryController.getById);
adminRouter.post('/categories', validateRequest(createCategorySchema), categoryController.create);
adminRouter.patch('/categories/:id', validateRequest(updateCategorySchema), categoryController.update);
adminRouter.delete('/categories/:id', validateRequest(categoryIdSchema), categoryController.remove);

adminRouter.get('/banners', bannerController.list);
adminRouter.get('/banners/:id', validateRequest(bannerIdSchema), bannerController.getById);
adminRouter.post('/banners', validateRequest(createBannerSchema), bannerController.create);
adminRouter.patch('/banners/:id', validateRequest(updateBannerSchema), bannerController.update);
adminRouter.delete('/banners/:id', validateRequest(bannerIdSchema), bannerController.remove);

adminRouter.get('/extras-products', extraProductController.list);
adminRouter.get('/extras-products/:id', validateRequest(extraProductIdSchema), extraProductController.getById);
adminRouter.post('/extras-products', validateRequest(createExtraProductSchema), extraProductController.create);
adminRouter.patch(
  '/extras-products/:id',
  validateRequest(updateExtraProductSchema),
  extraProductController.update
);
adminRouter.delete(
  '/extras-products/:id',
  validateRequest(extraProductIdSchema),
  extraProductController.remove
);

adminRouter.get('/users', adminUserController.list);
adminRouter.get('/users/:id', validateRequest(userIdSchema), adminUserController.getById);
adminRouter.patch('/users/:id', validateRequest(updateUserSchema), adminUserController.update);

adminRouter.get('/orders', adminOrderController.list);
adminRouter.get('/orders/:id', validateRequest(orderIdSchema), adminOrderController.getById);
adminRouter.patch(
  '/orders/:id/status',
  validateRequest(updateOrderStatusSchema),
  adminOrderController.updateStatus
);

adminRouter.get('/payments', adminPaymentController.list);
adminRouter.get('/payments/:id', validateRequest(paymentIdSchema), adminPaymentController.getById);
adminRouter.get('/refunds', adminPaymentController.listRefunds);

adminRouter.get('/config', adminConfigController.get);
adminRouter.patch('/config', validateRequest(updateConfigSchema), adminConfigController.update);

adminRouter.post('/uploads', uploadImage.single('file'), uploadController.upload);
adminRouter.put('/uploads', uploadImage.single('file'), uploadController.replace);
adminRouter.delete('/uploads', validateRequest(deleteUploadSchema), uploadController.remove);
