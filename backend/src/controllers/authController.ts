import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Generate OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS (mock implementation)
const sendOTP = async (phone: string, otp: string): Promise<boolean> => {
  try {
    // In production, integrate with Twilio or similar service
    logger.info(`OTP ${otp} sent to ${phone}`);
    return true;
  } catch (error) {
    logger.error('Failed to send OTP:', error);
    return false;
  }
};

// Request OTP
router.post('/request-otp', 
  authRateLimiter,
  [
    body('phone').isMobilePhone().withMessage('Valid phone number required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      const { phone } = req.body;
      const otp = generateOTP();

      // Store OTP in database (in production, use Redis for better performance)
      await prisma.user.upsert({
        where: { phone },
        update: {
          // Update OTP in a secure way
        },
        create: {
          phone,
          name: 'User', // Will be updated during registration
          isVerified: false,
        },
      });

      const otpSent = await sendOTP(phone, otp);
      if (!otpSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP',
        });
      }

      res.json({
        success: true,
        message: 'OTP sent successfully',
      });
    } catch (error) {
      logger.error('Request OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Verify OTP and login/register
router.post('/verify-otp',
  authRateLimiter,
  [
    body('phone').isMobilePhone().withMessage('Valid phone number required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('name').optional().isString().withMessage('Name must be a string'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      const { phone, otp, name } = req.body;

      // In production, verify OTP from database/Redis
      // For now, accept any 6-digit OTP for demo
      if (otp.length !== 6) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP',
        });
      }

      let user = await prisma.user.findUnique({
        where: { phone },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            phone,
            name: name || 'User',
            isVerified: true,
          },
        });
      } else {
        // Update existing user
        user = await prisma.user.update({
          where: { phone },
          data: {
            name: name || user.name,
            isVerified: true,
            lastActiveAt: new Date(),
          },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            email: user.email,
            preferredLanguage: user.preferredLanguage,
            isVerified: user.isVerified,
          },
          token,
        },
      });
    } catch (error) {
      logger.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Refresh token
router.post('/refresh',
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token required',
        });
      }

      // Verify refresh token and generate new access token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret') as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, phone: true, name: true },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      const newToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        data: {
          token: newToken,
        },
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  }
);

export default router; 