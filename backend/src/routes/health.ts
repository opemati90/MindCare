import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const dbHealth = await prisma.healthCheck();
    
    // Check other services (Redis, external APIs, etc.)
    const services = [
      {
        name: 'database',
        status: dbHealth.status,
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
      },
      // Add more service checks here
    ];

    const overallStatus = services.every(service => service.status === 'healthy') 
      ? 'healthy' 
      : 'unhealthy';

    const healthCheck = {
      status: overallStatus,
      timestamp: new Date(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      services,
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: overallStatus === 'healthy',
      data: healthCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        error: 'Health check failed',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
