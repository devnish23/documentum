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

// Generate invite code
const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create family
router.post('/',
  [
    body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Family name is required'),
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

      const { name } = req.body;
      const userId = req.user!.id;

      // Check if user already has a family
      const existingFamily = await prisma.familyMember.findFirst({
        where: { userId },
        include: { family: true },
      });

      if (existingFamily) {
        return res.status(400).json({
          success: false,
          message: 'User already belongs to a family',
        });
      }

      // Create family
      const family = await prisma.family.create({
        data: {
          name,
          inviteCode: generateInviteCode(),
          ownerId: userId,
          members: {
            create: {
              userId,
              role: 'owner',
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Family created successfully',
        data: {
          family: {
            id: family.id,
            name: family.name,
            inviteCode: family.inviteCode,
            members: family.members,
          },
        },
      });
    } catch (error) {
      logger.error('Create family error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Get user's family
router.get('/my-family',
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const familyMember = await prisma.familyMember.findFirst({
        where: { userId },
        include: {
          family: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!familyMember) {
        return res.status(404).json({
          success: false,
          message: 'User not part of any family',
        });
      }

      res.json({
        success: true,
        data: {
          family: {
            id: familyMember.family.id,
            name: familyMember.family.name,
            inviteCode: familyMember.family.inviteCode,
            members: familyMember.family.members,
            role: familyMember.role,
          },
        },
      });
    } catch (error) {
      logger.error('Get family error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Join family by invite code
router.post('/join',
  [
    body('inviteCode').isString().isLength({ min: 6, max: 6 }).withMessage('Valid invite code required'),
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

      const { inviteCode } = req.body;
      const userId = req.user!.id;

      // Check if user already has a family
      const existingFamily = await prisma.familyMember.findFirst({
        where: { userId },
      });

      if (existingFamily) {
        return res.status(400).json({
          success: false,
          message: 'User already belongs to a family',
        });
      }

      // Find family by invite code
      const family = await prisma.family.findUnique({
        where: { inviteCode },
      });

      if (!family) {
        return res.status(404).json({
          success: false,
          message: 'Invalid invite code',
        });
      }

      // Add user to family
      await prisma.familyMember.create({
        data: {
          familyId: family.id,
          userId,
          role: 'member',
        },
      });

      res.json({
        success: true,
        message: 'Successfully joined family',
        data: {
          family: {
            id: family.id,
            name: family.name,
          },
        },
      });
    } catch (error) {
      logger.error('Join family error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Add family member
router.post('/:familyId/members',
  [
    body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
    body('phone').isMobilePhone().withMessage('Valid phone number required'),
    body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member'),
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

      const { familyId } = req.params;
      const { name, phone, role = 'member' } = req.body;
      const userId = req.user!.id;

      // Check if user is family member
      const familyMember = await prisma.familyMember.findFirst({
        where: {
          familyId,
          userId,
          role: { in: ['owner', 'admin'] },
        },
      });

      if (!familyMember) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }

      // Create or find user
      let user = await prisma.user.findUnique({
        where: { phone },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            phone,
            name,
            isVerified: true,
          },
        });
      }

      // Check if user is already a member
      const existingMember = await prisma.familyMember.findFirst({
        where: {
          familyId,
          userId: user.id,
        },
      });

      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a family member',
        });
      }

      // Add member to family
      const newMember = await prisma.familyMember.create({
        data: {
          familyId,
          userId: user.id,
          role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Member added successfully',
        data: {
          member: newMember,
        },
      });
    } catch (error) {
      logger.error('Add member error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// Get family members
router.get('/:familyId/members',
  async (req: AuthRequest, res: Response) => {
    try {
      const { familyId } = req.params;
      const userId = req.user!.id;

      // Check if user is family member
      const familyMember = await prisma.familyMember.findFirst({
        where: {
          familyId,
          userId,
        },
      });

      if (!familyMember) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const members = await prisma.familyMember.findMany({
        where: {
          familyId,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: {
          members,
          totalCount: members.length,
        },
      });
    } catch (error) {
      logger.error('Get members error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

export default router; 