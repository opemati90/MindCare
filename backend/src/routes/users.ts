import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { validateRequest, userSchemas, commonSchemas } from '../middleware/validation';
import { requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/config';
import type { UpdateUserRequest, ChangePasswordRequest } from '@mindcare/shared-types';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [PATIENT, PROVIDER, ADMIN, SUPER_ADMIN]
 *         description: Filter by role
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', 
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  validateRequest({ query: commonSchemas.pagination }),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as any;
      const { role } = req.query as any;

      const where = role ? { role } : {};
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            profile: {
              select: {
                phoneNumber: true,
                dateOfBirth: true,
                gender: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: users,
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
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id',
  validateRequest({ params: commonSchemas.idParam }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if user can access this profile
      if (req.userId !== id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
        throw ApiError.forbidden('Cannot access other user profiles');
      }

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: {
            include: {
              address: true,
              emergencyContact: true,
            },
          },
        },
      });

      if (!user) {
        throw ApiError.notFound('User not found');
      }

      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: { user: userWithoutPassword },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               profile:
 *                 type: object
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:id',
  validateRequest({ 
    params: commonSchemas.idParam,
    body: userSchemas.update 
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body as UpdateUserRequest;

      // Check if user can update this profile
      if (req.userId !== id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
        throw ApiError.forbidden('Cannot update other user profiles');
      }

      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: { profile: true },
      });

      if (!existingUser) {
        throw ApiError.notFound('User not found');
      }

      // Update user and profile in transaction
      const updatedUser = await prisma.$transaction(async (tx) => {
        // Update user basic info
        const user = await tx.user.update({
          where: { id },
          data: {
            firstName: updateData.firstName,
            lastName: updateData.lastName,
          },
        });

        // Update profile if provided
        if (updateData.profile) {
          await tx.userProfile.upsert({
            where: { userId: id },
            create: {
              userId: id,
              ...updateData.profile,
            },
            update: updateData.profile,
          });
        }

        return tx.user.findUnique({
          where: { id },
          include: {
            profile: {
              include: {
                address: true,
                emergencyContact: true,
              },
            },
          },
        });
      });

      logger.info('User profile updated', {
        userId: id,
        updatedBy: req.userId,
      });

      const { password, ...userWithoutPassword } = updatedUser!;

      res.json({
        success: true,
        data: { user: userWithoutPassword },
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/users/{id}/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password
 */
router.post('/:id/change-password',
  validateRequest({ 
    params: commonSchemas.idParam,
    body: userSchemas.changePassword 
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body as ChangePasswordRequest;

      // Only allow users to change their own password
      if (req.userId !== id) {
        throw ApiError.forbidden('Cannot change other user passwords');
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw ApiError.notFound('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw ApiError.badRequest('Current password is incorrect', 'INVALID_PASSWORD');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

      // Update password
      await prisma.user.update({
        where: { id },
        data: { password: hashedNewPassword },
      });

      // Invalidate all refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId: id },
      });

      logger.info('User password changed', {
        userId: id,
      });

      res.json({
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Insufficient permissions
 */
router.delete('/:id',
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  validateRequest({ params: commonSchemas.idParam }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (req.userId === id) {
        throw ApiError.badRequest('Cannot delete your own account', 'SELF_DELETE_FORBIDDEN');
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw ApiError.notFound('User not found');
      }

      // Soft delete by deactivating
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      logger.info('User deactivated', {
        userId: id,
        deactivatedBy: req.userId,
      });

      res.json({
        success: true,
        message: 'User deactivated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
