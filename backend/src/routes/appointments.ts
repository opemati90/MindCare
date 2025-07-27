import { Router } from 'express';
import { validateRequest, appointmentSchemas, commonSchemas } from '../middleware/validation';
import { requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { CreateAppointmentRequest, UpdateAppointmentRequest } from '@mindcare/shared-types';

const router = Router();

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get appointments
 *     tags: [Appointments]
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
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 */
router.get('/',
  validateRequest({ 
    query: {
      ...commonSchemas.pagination,
      ...appointmentSchemas.filters,
    }
  }),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, sortBy = 'scheduledAt', sortOrder = 'asc' } = req.query as any;
      const { status, providerId, patientId, dateFrom, dateTo } = req.query as any;

      const skip = (page - 1) * limit;
      
      // Build where clause based on user role and filters
      let where: any = {};

      // Role-based filtering
      if (req.user!.role === 'PATIENT') {
        // Patients can only see their own appointments
        const patient = await prisma.patient.findUnique({
          where: { userId: req.userId },
        });
        if (!patient) {
          throw ApiError.notFound('Patient profile not found');
        }
        where.patientId = patient.id;
      } else if (req.user!.role === 'PROVIDER') {
        // Providers can only see their own appointments
        const provider = await prisma.healthcareProvider.findUnique({
          where: { userId: req.userId },
        });
        if (!provider) {
          throw ApiError.notFound('Provider profile not found');
        }
        where.providerId = provider.id;
      }

      // Apply additional filters
      if (status) where.status = status;
      if (providerId) where.providerId = providerId;
      if (patientId) where.patientId = patientId;
      
      if (dateFrom || dateTo) {
        where.scheduledAt = {};
        if (dateFrom) where.scheduledAt.gte = new Date(dateFrom);
        if (dateTo) where.scheduledAt.lte = new Date(dateTo);
      }

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
                specialties: {
                  include: {
                    specialty: true,
                  },
                },
              },
            },
            telehealth: true,
          },
        }),
        prisma.appointment.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: appointments,
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
 * /api/appointments:
 *   post:
 *     summary: Create new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerId:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *               type:
 *                 type: string
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 */
router.post('/',
  requireRole(['PATIENT']),
  validateRequest({ body: appointmentSchemas.create }),
  async (req, res, next) => {
    try {
      const appointmentData = req.body as CreateAppointmentRequest;

      // Get patient profile
      const patient = await prisma.patient.findUnique({
        where: { userId: req.userId },
      });

      if (!patient) {
        throw ApiError.notFound('Patient profile not found');
      }

      // Verify provider exists and is active
      const provider = await prisma.healthcareProvider.findUnique({
        where: { id: appointmentData.providerId },
        include: {
          user: true,
          availability: true,
        },
      });

      if (!provider || !provider.user.isActive) {
        throw ApiError.notFound('Provider not found or inactive');
      }

      // Check for scheduling conflicts
      const scheduledAt = new Date(appointmentData.scheduledAt);
      const endTime = new Date(scheduledAt.getTime() + appointmentData.duration * 60000);

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          providerId: appointmentData.providerId,
          status: {
            in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
          },
          OR: [
            {
              AND: [
                { scheduledAt: { lte: scheduledAt } },
                { scheduledAt: { gte: new Date(scheduledAt.getTime() - 60 * 60000) } }, // 1 hour buffer
              ],
            },
            {
              AND: [
                { scheduledAt: { gte: scheduledAt } },
                { scheduledAt: { lte: endTime } },
              ],
            },
          ],
        },
      });

      if (conflictingAppointment) {
        throw ApiError.conflict('Time slot is not available', 'TIME_SLOT_CONFLICT');
      }

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          providerId: appointmentData.providerId,
          scheduledAt,
          duration: appointmentData.duration,
          type: appointmentData.type,
          reason: appointmentData.reason,
          notes: appointmentData.notes,
        },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          provider: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      logger.info('Appointment created', {
        appointmentId: appointment.id,
        patientId: patient.id,
        providerId: appointmentData.providerId,
        scheduledAt: appointmentData.scheduledAt,
      });

      res.status(201).json({
        success: true,
        data: { appointment },
        message: 'Appointment created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
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
 *         description: Appointment retrieved successfully
 */
router.get('/:id',
  validateRequest({ params: commonSchemas.idParam }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          provider: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              specialties: {
                include: {
                  specialty: true,
                },
              },
            },
          },
          telehealth: true,
        },
      });

      if (!appointment) {
        throw ApiError.notFound('Appointment not found');
      }

      // Check access permissions
      const hasAccess = 
        req.user!.role === 'ADMIN' ||
        req.user!.role === 'SUPER_ADMIN' ||
        appointment.patient.userId === req.userId ||
        appointment.provider.userId === req.userId;

      if (!hasAccess) {
        throw ApiError.forbidden('Cannot access this appointment');
      }

      res.json({
        success: true,
        data: { appointment },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
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
 *         description: Appointment updated successfully
 */
router.put('/:id',
  validateRequest({ 
    params: commonSchemas.idParam,
    body: appointmentSchemas.update 
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body as UpdateAppointmentRequest;

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          patient: true,
          provider: true,
        },
      });

      if (!appointment) {
        throw ApiError.notFound('Appointment not found');
      }

      // Check permissions
      const canUpdate = 
        req.user!.role === 'ADMIN' ||
        req.user!.role === 'SUPER_ADMIN' ||
        appointment.patient.userId === req.userId ||
        appointment.provider.userId === req.userId;

      if (!canUpdate) {
        throw ApiError.forbidden('Cannot update this appointment');
      }

      // If rescheduling, check for conflicts
      if (updateData.scheduledAt) {
        const newScheduledAt = new Date(updateData.scheduledAt);
        const duration = updateData.duration || appointment.duration;
        const endTime = new Date(newScheduledAt.getTime() + duration * 60000);

        const conflictingAppointment = await prisma.appointment.findFirst({
          where: {
            id: { not: id },
            providerId: appointment.providerId,
            status: {
              in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
            },
            OR: [
              {
                AND: [
                  { scheduledAt: { lte: newScheduledAt } },
                  { scheduledAt: { gte: new Date(newScheduledAt.getTime() - 60 * 60000) } },
                ],
              },
              {
                AND: [
                  { scheduledAt: { gte: newScheduledAt } },
                  { scheduledAt: { lte: endTime } },
                ],
              },
            ],
          },
        });

        if (conflictingAppointment) {
          throw ApiError.conflict('Time slot is not available', 'TIME_SLOT_CONFLICT');
        }
      }

      const updatedAppointment = await prisma.appointment.update({
        where: { id },
        data: {
          ...(updateData.scheduledAt && { scheduledAt: new Date(updateData.scheduledAt) }),
          ...(updateData.duration && { duration: updateData.duration }),
          ...(updateData.type && { type: updateData.type }),
          ...(updateData.reason && { reason: updateData.reason }),
          ...(updateData.notes !== undefined && { notes: updateData.notes }),
          ...(updateData.status && { status: updateData.status }),
        },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          provider: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          telehealth: true,
        },
      });

      logger.info('Appointment updated', {
        appointmentId: id,
        updatedBy: req.userId,
        changes: updateData,
      });

      res.json({
        success: true,
        data: { appointment: updatedAppointment },
        message: 'Appointment updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   post:
 *     summary: Cancel appointment
 *     tags: [Appointments]
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
 *         description: Appointment cancelled successfully
 */
router.post('/:id/cancel',
  validateRequest({ params: commonSchemas.idParam }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          patient: true,
          provider: true,
        },
      });

      if (!appointment) {
        throw ApiError.notFound('Appointment not found');
      }

      // Check permissions
      const canCancel = 
        req.user!.role === 'ADMIN' ||
        req.user!.role === 'SUPER_ADMIN' ||
        appointment.patient.userId === req.userId ||
        appointment.provider.userId === req.userId;

      if (!canCancel) {
        throw ApiError.forbidden('Cannot cancel this appointment');
      }

      if (appointment.status === 'CANCELLED') {
        throw ApiError.badRequest('Appointment is already cancelled');
      }

      if (appointment.status === 'COMPLETED') {
        throw ApiError.badRequest('Cannot cancel completed appointment');
      }

      const cancelledAppointment = await prisma.appointment.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          provider: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      logger.info('Appointment cancelled', {
        appointmentId: id,
        cancelledBy: req.userId,
      });

      res.json({
        success: true,
        data: { appointment: cancelledAppointment },
        message: 'Appointment cancelled successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
