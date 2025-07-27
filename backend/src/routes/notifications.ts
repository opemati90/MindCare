import { Router } from 'express';
import { validateRequest, commonSchemas } from '../middleware/validation';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get('/',
  validateRequest({ query: commonSchemas.pagination }),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as any;
      const { isRead } = req.query as any;
      const skip = (page - 1) * limit;

      let where: any = {
        userId: req.userId,
      };

      if (isRead !== undefined) {
        where.isRead = isRead === 'true';
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.notification.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   post:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.post('/:id/read',
  validateRequest({ params: commonSchemas.idParam }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        throw ApiError.notFound('Notification not found');
      }

      if (notification.userId !== req.userId) {
        throw ApiError.forbidden('Cannot access this notification');
      }

      const updatedNotification = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      res.json({
        success: true,
        data: { notification: updatedNotification },
        message: 'Notification marked as read',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   post:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.post('/mark-all-read',
  async (req, res, next) => {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId: req.userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      logger.info('All notifications marked as read', {
        userId: req.userId,
        count: result.count,
      });

      res.json({
        success: true,
        data: { updatedCount: result.count },
        message: 'All notifications marked as read',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
