import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { requestOtpSchema, verifyOtpSchema } from '../validators/auth.validators';

export const authRouter = Router();

authRouter.post('/otp/request', validateRequest(requestOtpSchema), authController.requestOtp);
authRouter.post('/otp/verify', validateRequest(verifyOtpSchema), authController.verifyOtp);
