import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
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

// Get orders
router.get('/',
  [
    query('status').optional().isString().withMessage('Status must be a string'),
    query('merchantId').optional().isString().withMessage('Merchant ID must be a string'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
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
      const { status, merchantId, limit = 20 } = req.query;

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

      // Build where clause
      const where: any = {
        familyId: familyMember.family.id,
      };

      if (status) {
        where.status = status;
      }

      if (merchantId) {
        where.merchantId = merchantId;
      }

      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              inventoryItem: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: {
          orders,
          totalCount: orders.length,
        },
      });
    } catch (error) {
      logger.error('Get orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Create order
router.post('/',
  [
    body('merchantId').optional().isString().withMessage('Merchant ID must be a string'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.inventoryItemId').optional().isString().withMessage('Inventory item ID must be a string'),
    body('items.*.name').isString().isLength({ min: 1, max: 200 }).withMessage('Item name is required'),
    body('items.*.quantity').isFloat({ min: 0.1 }).withMessage('Quantity must be a positive number'),
    body('items.*.unit').optional().isString().withMessage('Unit must be a string'),
    body('items.*.notes').optional().isString().withMessage('Notes must be a string'),
    body('notes').optional().isString().withMessage('Order notes must be a string'),
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
      const { merchantId, items, notes } = req.body;

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

      // Validate merchant if provided
      if (merchantId) {
        const merchant = await prisma.merchant.findFirst({
          where: {
            id: merchantId,
            familyId: familyMember.family.id,
            isActive: true,
          },
        });

        if (!merchant) {
          return res.status(404).json({
            success: false,
            message: 'Merchant not found',
          });
        }
      }

      // Create order with items
      const order = await prisma.order.create({
        data: {
          familyId: familyMember.family.id,
          merchantId,
          notes,
          createdBy: userId,
          items: {
            create: items.map((item: any) => ({
              name: item.name,
              quantity: Number(item.quantity),
              unit: item.unit || 'pieces',
              notes: item.notes,
              inventoryItemId: item.inventoryItemId,
            })),
          },
        },
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              inventoryItem: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          order,
        },
      });
    } catch (error) {
      logger.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Update order status
router.patch('/:orderId/status',
  [
    body('status').isIn(['pending', 'processing', 'completed', 'cancelled']).withMessage('Invalid status'),
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

      const { orderId } = req.params;
      const { status } = req.body;
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

      // Check if order exists and belongs to user's family
      const existingOrder = await prisma.order.findFirst({
        where: {
          id: orderId,
          familyId: familyMember.family.id,
        },
      });

      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Update order status
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (status === 'completed') {
        updateData.completedAt = new Date();
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              inventoryItem: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: {
          order: updatedOrder,
        },
      });
    } catch (error) {
      logger.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Get order details
router.get('/:orderId',
  async (req: AuthRequest, res: Response) => {
    try {
      const { orderId } = req.params;
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

      // Get order details
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          familyId: familyMember.family.id,
        },
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              address: true,
            },
          },
          items: {
            include: {
              inventoryItem: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      res.json({
        success: true,
        data: {
          order,
        },
      });
    } catch (error) {
      logger.error('Get order details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

export default router; 