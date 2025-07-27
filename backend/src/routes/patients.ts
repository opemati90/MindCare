import { Router } from 'express';
import { validateRequest, commonSchemas, medicalRecordSchemas } from '../middleware/validation';
import { requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients (Provider/Admin only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 */
router.get('/',
  requireRole(['PROVIDER', 'ADMIN', 'SUPER_ADMIN']),
  validateRequest({ query: commonSchemas.pagination }),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as any;
      const skip = (page - 1) * limit;

      let where: any = {};

      // If provider, only show their patients
      if (req.user!.role === 'PROVIDER') {
        const provider = await prisma.healthcareProvider.findUnique({
          where: { userId: req.userId },
        });
        
        if (!provider) {
          throw ApiError.notFound('Provider profile not found');
        }

        // Get patients who have appointments with this provider
        where = {
          appointments: {
            some: {
              providerId: provider.id,
            },
          },
        };
      }

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
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
            _count: {
              select: {
                appointments: true,
                medicalRecords: true,
              },
            },
          },
        }),
        prisma.patient.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: patients,
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
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
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
 *         description: Patient retrieved successfully
 */
router.get('/:id',
  validateRequest({ params: commonSchemas.idParam }),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
          user: {
            include: {
              profile: {
                include: {
                  address: true,
                  emergencyContact: true,
                },
              },
            },
          },
          insuranceInfo: true,
          medications: true,
          _count: {
            select: {
              appointments: true,
              medicalRecords: true,
            },
          },
        },
      });

      if (!patient) {
        throw ApiError.notFound('Patient not found');
      }

      // Check access permissions
      const hasAccess = 
        req.user!.role === 'ADMIN' ||
        req.user!.role === 'SUPER_ADMIN' ||
        patient.userId === req.userId;

      if (!hasAccess && req.user!.role === 'PROVIDER') {
        // Check if provider has treated this patient
        const provider = await prisma.healthcareProvider.findUnique({
          where: { userId: req.userId },
        });

        if (provider) {
          const hasAppointment = await prisma.appointment.findFirst({
            where: {
              patientId: id,
              providerId: provider.id,
            },
          });

          if (!hasAppointment) {
            throw ApiError.forbidden('Cannot access this patient');
          }
        } else {
          throw ApiError.forbidden('Cannot access this patient');
        }
      }

      res.json({
        success: true,
        data: { patient },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/patients/{id}/medical-records:
 *   get:
 *     summary: Get patient medical records
 *     tags: [Patients]
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
 *         description: Medical records retrieved successfully
 */
router.get('/:id/medical-records',
  validateRequest({ 
    params: commonSchemas.idParam,
    query: commonSchemas.pagination 
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, sortBy = 'visitDate', sortOrder = 'desc' } = req.query as any;
      const skip = (page - 1) * limit;

      // Verify patient exists and check access
      const patient = await prisma.patient.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!patient) {
        throw ApiError.notFound('Patient not found');
      }

      const hasAccess = 
        req.user!.role === 'ADMIN' ||
        req.user!.role === 'SUPER_ADMIN' ||
        patient.userId === req.userId;

      if (!hasAccess && req.user!.role === 'PROVIDER') {
        const provider = await prisma.healthcareProvider.findUnique({
          where: { userId: req.userId },
        });

        if (!provider) {
          throw ApiError.forbidden('Cannot access medical records');
        }

        // Providers can only see records they created
        const [records, total] = await Promise.all([
          prisma.medicalRecord.findMany({
            where: {
              patientId: id,
              providerId: provider.id,
            },
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
              provider: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
              attachments: true,
            },
          }),
          prisma.medicalRecord.count({
            where: {
              patientId: id,
              providerId: provider.id,
            },
          }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.json({
          success: true,
          data: records,
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
      }

      // For patients and admins, show all records
      const [records, total] = await Promise.all([
        prisma.medicalRecord.findMany({
          where: { patientId: id },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            attachments: true,
          },
        }),
        prisma.medicalRecord.count({ where: { patientId: id } }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: records,
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
 * /api/patients/{id}/medical-records:
 *   post:
 *     summary: Create medical record (Provider only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Medical record created successfully
 */
router.post('/:id/medical-records',
  requireRole(['PROVIDER']),
  validateRequest({ 
    params: commonSchemas.idParam,
    body: medicalRecordSchemas.create 
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const recordData = req.body;

      // Get provider profile
      const provider = await prisma.healthcareProvider.findUnique({
        where: { userId: req.userId },
      });

      if (!provider) {
        throw ApiError.notFound('Provider profile not found');
      }

      // Verify patient exists
      const patient = await prisma.patient.findUnique({
        where: { id },
      });

      if (!patient) {
        throw ApiError.notFound('Patient not found');
      }

      const medicalRecord = await prisma.medicalRecord.create({
        data: {
          patientId: id,
          providerId: provider.id,
          visitDate: new Date(recordData.visitDate),
          diagnosis: recordData.diagnosis,
          treatment: recordData.treatment,
          notes: recordData.notes,
        },
        include: {
          provider: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          attachments: true,
        },
      });

      logger.info('Medical record created', {
        recordId: medicalRecord.id,
        patientId: id,
        providerId: provider.id,
      });

      res.status(201).json({
        success: true,
        data: { medicalRecord },
        message: 'Medical record created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
