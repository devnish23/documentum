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

// Get inventory items
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('sortBy').optional().isIn(['name', 'quantity', 'expiryDate', 'dateAdded']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
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
      const { page = 1, limit = 20, category, search, sortBy = 'name', sortOrder = 'asc' } = req.query;

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
        isActive: true,
      };

      if (category) {
        where.category = category;
      }

      if (search) {
        where.name = {
          contains: search as string,
          mode: 'insensitive',
        };
      }

      // Build order by clause
      const orderBy: any = {};
      if (sortBy === 'dateAdded') {
        orderBy.createdAt = sortOrder;
      } else {
        orderBy[sortBy as string] = sortOrder;
      }

      // Get items with pagination
      const [items, totalCount] = await Promise.all([
        prisma.inventoryItem.findMany({
          where,
          orderBy,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          include: {
            addedByUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.inventoryItem.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          items,
          totalCount,
          page: Number(page),
          hasMore: Number(page) * Number(limit) < totalCount,
        },
      });
    } catch (error) {
      logger.error('Get inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Add inventory item
router.post('/',
  [
    body('name').isString().isLength({ min: 1, max: 200 }).withMessage('Item name is required'),
    body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
    body('unit').optional().isString().withMessage('Unit must be a string'),
    body('category').isString().withMessage('Category is required'),
    body('barcode').optional().isString().withMessage('Barcode must be a string'),
    body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date format'),
    body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
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
      const { name, quantity, unit = 'pieces', category, barcode, expiryDate, imageUrl, notes } = req.body;

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

      // Check for duplicate item
      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          familyId: familyMember.family.id,
          name: { equals: name, mode: 'insensitive' },
          isActive: true,
        },
      });

      let item;
      let isDuplicate = false;
      let previousQuantity = 0;

      if (existingItem) {
        // Update existing item quantity
        item = await prisma.inventoryItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + Number(quantity),
            updatedAt: new Date(),
          },
          include: {
            addedByUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        isDuplicate = true;
        previousQuantity = Number(existingItem.quantity);
      } else {
        // Create new item
        item = await prisma.inventoryItem.create({
          data: {
            familyId: familyMember.family.id,
            name,
            quantity: Number(quantity),
            unit,
            category,
            barcode,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            imageUrl,
            notes,
            addedBy: userId,
          },
          include: {
            addedByUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      }

      res.status(201).json({
        success: true,
        message: isDuplicate ? 'Item quantity updated' : 'Item added successfully',
        data: {
          item,
          isDuplicate,
          previousQuantity,
        },
      });
    } catch (error) {
      logger.error('Add inventory item error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Update inventory item
router.patch('/:itemId',
  [
    body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
    body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date format'),
    body('name').optional().isString().isLength({ min: 1, max: 200 }).withMessage('Item name must be a string'),
    body('category').optional().isString().withMessage('Category must be a string'),
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

      const { itemId } = req.params;
      const userId = req.user!.id;
      const updateData: any = {};

      // Build update data
      if (req.body.quantity !== undefined) updateData.quantity = Number(req.body.quantity);
      if (req.body.expiryDate !== undefined) updateData.expiryDate = req.body.expiryDate ? new Date(req.body.expiryDate) : null;
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.category !== undefined) updateData.category = req.body.category;
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

      // Check if item exists and belongs to user's family
      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          id: itemId,
          familyId: familyMember.family.id,
          isActive: true,
        },
      });

      if (!existingItem) {
        return res.status(404).json({
          success: false,
          message: 'Item not found',
        });
      }

      // Update item
      const updatedItem = await prisma.inventoryItem.update({
        where: { id: itemId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          addedByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Item updated successfully',
        data: {
          item: updatedItem,
          updated: Object.keys(updateData),
        },
      });
    } catch (error) {
      logger.error('Update inventory item error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Delete inventory item
router.delete('/:itemId',
  async (req: AuthRequest, res: Response) => {
    try {
      const { itemId } = req.params;
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

      // Check if item exists and belongs to user's family
      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          id: itemId,
          familyId: familyMember.family.id,
          isActive: true,
        },
      });

      if (!existingItem) {
        return res.status(404).json({
          success: false,
          message: 'Item not found',
        });
      }

      // Soft delete item
      await prisma.inventoryItem.update({
        where: { id: itemId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Item deleted successfully',
      });
    } catch (error) {
      logger.error('Delete inventory item error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

export default router; 