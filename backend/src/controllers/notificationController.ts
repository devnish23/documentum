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

// Get notifications
router.get('/',
  [
    query('type').optional().isString().withMessage('Type must be a string'),
    query('read').optional().isBoolean().withMessage('Read must be a boolean'),
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
      const { type, read, limit = 20 } = req.query;

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

      if (type) {
        where.type = type;
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        take: Number(limit),
      });

      // Get unread count
      const unreadCount = await prisma.notification.count({
        where: {
          familyId: familyMember.family.id,
          reads: {
            none: {
              userId,
            },
          },
        },
      });

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (error) {
      logger.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Mark notification as read
router.post('/:notificationId/read',
  async (req: AuthRequest, res: Response) => {
    try {
      const { notificationId } = req.params;
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

      // Check if notification exists and belongs to user's family
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          familyId: familyMember.family.id,
        },
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      // Mark as read
      await prisma.notificationRead.upsert({
        where: {
          notificationId_userId: {
            notificationId,
            userId,
          },
        },
        update: {
          readAt: new Date(),
        },
        create: {
          notificationId,
          userId,
        },
      });

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Create notification (internal use)
export const createNotification = async (
  familyId: string,
  type: string,
  title: string,
  message: string,
  recipients: string[],
  data?: any
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        familyId,
        type,
        title,
        message,
        recipients,
        data,
      },
    });

    logger.info(`Notification created: ${notification.id} for family ${familyId}`);
    return notification;
  } catch (error) {
    logger.error('Create notification error:', error);
    throw error;
  }
};

// Send notification to family members
router.post('/send',
  [
    body('type').isString().withMessage('Type is required'),
    body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
    body('message').isString().isLength({ min: 1 }).withMessage('Message is required'),
    body('recipients').optional().isArray().withMessage('Recipients must be an array'),
    body('data').optional().isObject().withMessage('Data must be an object'),
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
      const { type, title, message, recipients, data } = req.body;

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

      // Get all family members if no specific recipients
      let notificationRecipients = recipients;
      if (!recipients || recipients.length === 0) {
        const familyMembers = await prisma.familyMember.findMany({
          where: {
            familyId: familyMember.family.id,
            isActive: true,
          },
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        });
        notificationRecipients = familyMembers.map(member => member.user.id);
      }

      const notification = await createNotification(
        familyMember.family.id,
        type,
        title,
        message,
        notificationRecipients,
        data
      );

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: {
          notification,
        },
      });
    } catch (error) {
      logger.error('Send notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

export default router; 