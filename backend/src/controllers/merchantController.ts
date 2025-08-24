import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    phone: string;
    name: string;
  };
}

const router = Router();

// Get merchants
router.get('/',
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      // Get user's family
      const familyMember = await prisma.familyMember.findFirst({
        where: { userId },
        include: { family: true },
      });

      if (!familyMember) {
        return res.status(404).json({
          success: false,
          message: 'User not part of any family',
        });
      }

      const merchants = await prisma.merchant.findMany({
        where: {
          familyId: familyMember.family.id,
          isActive: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: {
          merchants,
        },
      });
    } catch (error) {
      logger.error('Get merchants error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Add merchant
router.post('/',
  [
    body('name').isString().isLength({ min: 1, max: 200 }).withMessage('Merchant name is required'),
    body('type').isString().withMessage('Merchant type is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('address').optional().isObject().withMessage('Address must be an object'),
    body('categories').optional().isArray().withMessage('Categories must be an array'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      const userId = req.user!.id;
      const { name, type, phone, email, address, categories = [], notes } = req.body;

      // Get user's family
      const familyMember = await prisma.familyMember.findFirst({
        where: { userId },
        include: { family: true },
      });

      if (!familyMember) {
        return res.status(404).json({
          success: false,
          message: 'User not part of any family',
        });
      }

      const merchant = await prisma.merchant.create({
        data: {
          familyId: familyMember.family.id,
          name,
          type,
          phone,
          email,
          address,
          categories,
          notes,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Merchant added successfully',
        data: {
          merchant,
        },
      });
    } catch (error) {
      logger.error('Add merchant error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Update merchant
router.patch('/:merchantId',
  [
    body('name').optional().isString().isLength({ min: 1, max: 200 }).withMessage('Merchant name must be a string'),
    body('type').optional().isString().withMessage('Merchant type must be a string'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('address').optional().isObject().withMessage('Address must be an object'),
    body('categories').optional().isArray().withMessage('Categories must be an array'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      const { merchantId } = req.params;
      const userId = req.user!.id;
      const updateData: any = {};

      // Build update data
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.type !== undefined) updateData.type = req.body.type;
      if (req.body.phone !== undefined) updateData.phone = req.body.phone;
      if (req.body.email !== undefined) updateData.email = req.body.email;
      if (req.body.address !== undefined) updateData.address = req.body.address;
      if (req.body.categories !== undefined) updateData.categories = req.body.categories;
      if (req.body.notes !== undefined) updateData.notes = req.body.notes;

      // Get user's family
      const familyMember = await prisma.familyMember.findFirst({
        where: { userId },
        include: { family: true },
      });

      if (!familyMember) {
        return res.status(404).json({
          success: false,
          message: 'User not part of any family',
        });
      }

      // Check if merchant exists and belongs to user's family
      const existingMerchant = await prisma.merchant.findFirst({
        where: {
          id: merchantId,
          familyId: familyMember.family.id,
          isActive: true,
        },
      });

      if (!existingMerchant) {
        return res.status(404).json({
          success: false,
          message: 'Merchant not found',
        });
      }

      // Update merchant
      const updatedMerchant = await prisma.merchant.update({
        where: { id: merchantId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Merchant updated successfully',
        data: {
          merchant: updatedMerchant,
          updated: Object.keys(updateData),
        },
      });
    } catch (error) {
      logger.error('Update merchant error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Delete merchant
router.delete('/:merchantId',
  async (req: AuthRequest, res: Response) => {
    try {
      const { merchantId } = req.params;
      const userId = req.user!.id;

      // Get user's family
      const familyMember = await prisma.familyMember.findFirst({
        where: { userId },
        include: { family: true },
      });

      if (!familyMember) {
        return res.status(404).json({
          success: false,
          message: 'User not part of any family',
        });
      }

      // Check if merchant exists and belongs to user's family
      const existingMerchant = await prisma.merchant.findFirst({
        where: {
          id: merchantId,
          familyId: familyMember.family.id,
          isActive: true,
        },
      });

      if (!existingMerchant) {
        return res.status(404).json({
          success: false,
          message: 'Merchant not found',
        });
      }

      // Soft delete merchant
      await prisma.merchant.update({
        where: { id: merchantId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Merchant deleted successfully',
      });
    } catch (error) {
      logger.error('Delete merchant error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

export default router; 