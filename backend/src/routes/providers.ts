import { Router } from 'express';
import { validateRequest, commonSchemas, providerSchemas } from '../middleware/validation';
import { requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: Get all providers
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Providers retrieved successfully
 */
router.get('/',
  validateRequest({ 
    query: {
      ...commonSchemas.pagination,
      ...providerSchemas.filters,
    }
  }),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as any;
      const { specialtyId, isAvailable } = req.query as any;
      const skip = (page - 1) * limit;

      let where: any = {
        user: {
          isActive: true,
        },
      };

      if (specialtyId) {
        where.specialties = {
          some: {
            specialtyId,
          },
        };
      }

      const [providers, total] = await Promise.all([
        prisma.healthcareProvider.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
              },
            },
            license: true,
            specialties: {
              include: {
                specialty: true,
              },
            },
            availability: true,
            _count: {
              select: {
                appointments: true,
              },
            },
          },
        }),
        prisma.healthcareProvider.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: providers,
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
 * /api/providers/{id}:
 *   get:
 *     summary: Get provider by ID
 *     tags: [Providers]
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
 *         description: Provider retrieved successfully
 */
router.get('/:id',
  validateRequest({ params: commonSchemas.idParam }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const provider = await prisma.healthcareProvider.findUnique({
        where: { id },
        include: {
          user: {
            include: {
              profile: {
                include: {
                  address: true,
                },
              },
            },
          },
          license: true,
          specialties: {
            include: {
              specialty: true,
            },
          },
          availability: true,
          _count: {
            select: {
              appointments: true,
              medicalRecords: true,
            },
          },
        },
      });

      if (!provider) {
        throw ApiError.notFound('Provider not found');
      }

      res.json({
        success: true,
        data: { provider },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/providers/{id}/availability:
 *   get:
 *     summary: Get provider availability
 *     tags: [Providers]
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
 *         description: Provider availability retrieved successfully
 */
router.get('/:id/availability',
  validateRequest({ params: commonSchemas.idParam }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const provider = await prisma.healthcareProvider.findUnique({
        where: { id },
        include: {
          availability: {
            orderBy: {
              dayOfWeek: 'asc',
            },
          },
        },
      });

      if (!provider) {
        throw ApiError.notFound('Provider not found');
      }

      res.json({
        success: true,
        data: { availability: provider.availability },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/providers/{id}/availability:
 *   put:
 *     summary: Update provider availability (Provider only)
 *     tags: [Providers]
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
 *         description: Provider availability updated successfully
 */
router.put('/:id/availability',
  requireRole(['PROVIDER', 'ADMIN', 'SUPER_ADMIN']),
  validateRequest({ 
    params: commonSchemas.idParam,
    body: providerSchemas.updateAvailability 
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { availability } = req.body;

      const provider = await prisma.healthcareProvider.findUnique({
        where: { id },
      });

      if (!provider) {
        throw ApiError.notFound('Provider not found');
      }

      // Check if user can update this provider's availability
      if (req.user!.role === 'PROVIDER' && provider.userId !== req.userId) {
        throw ApiError.forbidden('Cannot update other provider availability');
      }

      // Update availability in transaction
      const updatedAvailability = await prisma.$transaction(async (tx) => {
        // Delete existing availability
        await tx.providerAvailability.deleteMany({
          where: { providerId: id },
        });

        // Create new availability records
        const newAvailability = await tx.providerAvailability.createMany({
          data: availability.map((slot: any) => ({
            providerId: id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: slot.isAvailable,
          })),
        });

        return tx.providerAvailability.findMany({
          where: { providerId: id },
          orderBy: { dayOfWeek: 'asc' },
        });
      });

      logger.info('Provider availability updated', {
        providerId: id,
        updatedBy: req.userId,
      });

      res.json({
        success: true,
        data: { availability: updatedAvailability },
        message: 'Availability updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/providers/{id}/available-slots:
 *   get:
 *     summary: Get available appointment slots
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: duration
 *         schema:
 *           type: integer
 *           default: 60
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 */
router.get('/:id/available-slots',
  validateRequest({ params: commonSchemas.idParam }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { date, duration = 60 } = req.query as any;

      if (!date) {
        throw ApiError.badRequest('Date parameter is required');
      }

      const requestedDate = new Date(date);
      const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'UPPERCASE' }) as any;

      // Get provider availability for the requested day
      const availability = await prisma.providerAvailability.findFirst({
        where: {
          providerId: id,
          dayOfWeek,
          isAvailable: true,
        },
      });

      if (!availability) {
        return res.json({
          success: true,
          data: { slots: [] },
          message: 'No availability for this date',
          timestamp: new Date().toISOString(),
        });
      }

      // Get existing appointments for the date
      const startOfDay = new Date(requestedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(requestedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await prisma.appointment.findMany({
        where: {
          providerId: id,
          scheduledAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
          },
        },
        select: {
          scheduledAt: true,
          duration: true,
        },
      });

      // Generate available slots
      const slots = [];
      const [startHour, startMinute] = availability.startTime.split(':').map(Number);
      const [endHour, endMinute] = availability.endTime.split(':').map(Number);

      const startTime = new Date(requestedDate);
      startTime.setHours(startHour, startMinute, 0, 0);
      const endTime = new Date(requestedDate);
      endTime.setHours(endHour, endMinute, 0, 0);

      let currentTime = new Date(startTime);
      const slotDuration = parseInt(duration as string);

      while (currentTime.getTime() + slotDuration * 60000 <= endTime.getTime()) {
        const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
        
        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.scheduledAt);
          const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);
          
          return (
            (currentTime >= appointmentStart && currentTime < appointmentEnd) ||
            (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
            (currentTime <= appointmentStart && slotEnd >= appointmentEnd)
          );
        });

        if (!hasConflict) {
          slots.push({
            startTime: currentTime.toISOString(),
            endTime: slotEnd.toISOString(),
            duration: slotDuration,
          });
        }

        // Move to next slot (15-minute intervals)
        currentTime = new Date(currentTime.getTime() + 15 * 60000);
      }

      res.json({
        success: true,
        data: { slots },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/providers/specialties:
 *   get:
 *     summary: Get all specialties
 *     tags: [Providers]
 *     responses:
 *       200:
 *         description: Specialties retrieved successfully
 */
router.get('/specialties',
  async (req, res, next) => {
    try {
      const specialties = await prisma.specialty.findMany({
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: specialties,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
