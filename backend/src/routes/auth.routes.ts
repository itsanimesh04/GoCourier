import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import {
  requestOtpSchema,
  verifyOtpSchema,
  signupSchema,
  loginSchema
} from '../validators/auth.validators';

export const authRouter = Router();

authRouter.post('/signup', validateRequest(signupSchema), authController.signup);
authRouter.post('/login', validateRequest(loginSchema), authController.login);
authRouter.post('/logout', authController.logout);
authRouter.post('/otp/request', validateRequest(requestOtpSchema), authController.requestOtp);
authRouter.post('/otp/verify', validateRequest(verifyOtpSchema), authController.verifyOtp);
