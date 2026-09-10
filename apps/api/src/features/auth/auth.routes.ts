import { Router, type IRouter } from 'express'
import { loginLimiter, signupLimiter } from '../../middleware/rate-limit'
import { validate } from '../../middleware/validate'
import {
  SignupSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from '@propella/shared'
import { authenticate } from '../../middleware/auth'
import * as authController from './auth.controller'

const router: IRouter = Router()

router.post('/signup', signupLimiter, validate(SignupSchema), authController.signup)
router.post('/login', loginLimiter, validate(LoginSchema), authController.login)
router.post('/logout', authController.logout)
router.post('/refresh', authController.refresh)
router.post(
  '/verify-email',
  authenticate,
  validate(VerifyEmailSchema),
  authController.verifyEmail,
)
router.post('/resend-verification', authenticate, authController.resendVerification)
router.get('/dev-verification-code', authenticate, authController.devVerificationCode)
router.post('/forgot-password', validate(ForgotPasswordSchema), authController.forgotPassword)
router.post('/reset-password', validate(ResetPasswordSchema), authController.resetPassword)

export default router
