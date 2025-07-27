import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { config } from '../config/config';
import { logger } from '../utils/logger';

async function main() {
  logger.info('Starting database seed...');

  try {
    // Create specialties
    const specialties = await Promise.all([
      prisma.specialty.upsert({
        where: { name: 'General Medicine' },
        update: {},
        create: {
          name: 'General Medicine',
          description: 'Primary care and general health services',
        },
      }),
      prisma.specialty.upsert({
        where: { name: 'Cardiology' },
        update: {},
        create: {
          name: 'Cardiology',
          description: 'Heart and cardiovascular system care',
        },
      }),
      prisma.specialty.upsert({
        where: { name: 'Dermatology' },
        update: {},
        create: {
          name: 'Dermatology',
          description: 'Skin, hair, and nail care',
        },
      }),
      prisma.specialty.upsert({
        where: { name: 'Pediatrics' },
        update: {},
        create: {
          name: 'Pediatrics',
          description: 'Medical care for infants, children, and adolescents',
        },
      }),
      prisma.specialty.upsert({
        where: { name: 'Orthopedics' },
        update: {},
        create: {
          name: 'Orthopedics',
          description: 'Musculoskeletal system care',
        },
      }),
    ]);

    logger.info(`Created ${specialties.length} specialties`);

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', config.security.bcryptRounds);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@mindcare.com' },
      update: {},
      create: {
        email: 'admin@mindcare.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN',
        profile: {
          create: {
            phoneNumber: '+1234567890',
          },
        },
      },
    });

    logger.info('Created admin user');

    // Create sample provider
    const providerPassword = await bcrypt.hash('provider123', config.security.bcryptRounds);
    const providerUser = await prisma.user.upsert({
      where: { email: 'dr.smith@mindcare.com' },
      update: {},
      create: {
        email: 'dr.smith@mindcare.com',
        password: providerPassword,
        firstName: 'John',
        lastName: 'Smith',
        role: 'PROVIDER',
        profile: {
          create: {
            phoneNumber: '+1234567891',
            gender: 'MALE',
          },
        },
      },
    });

    const provider = await prisma.healthcareProvider.upsert({
      where: { userId: providerUser.id },
      update: {},
      create: {
        userId: providerUser.id,
        license: {
          create: {
            licenseNumber: 'MD123456',
            state: 'CA',
            expirationDate: new Date('2025-12-31'),
            isActive: true,
          },
        },
        specialties: {
          create: [
            { specialtyId: specialties[0].id }, // General Medicine
            { specialtyId: specialties[1].id }, // Cardiology
          ],
        },
        availability: {
          create: [
            {
              dayOfWeek: 'MONDAY',
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: true,
            },
            {
              dayOfWeek: 'TUESDAY',
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: true,
            },
            {
              dayOfWeek: 'WEDNESDAY',
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: true,
            },
            {
              dayOfWeek: 'THURSDAY',
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: true,
            },
            {
              dayOfWeek: 'FRIDAY',
              startTime: '09:00',
              endTime: '15:00',
              isAvailable: true,
            },
          ],
        },
      },
    });

    logger.info('Created sample provider');

    // Create sample patient
    const patientPassword = await bcrypt.hash('patient123', config.security.bcryptRounds);
    const patientUser = await prisma.user.upsert({
      where: { email: 'jane.doe@example.com' },
      update: {},
      create: {
        email: 'jane.doe@example.com',
        password: patientPassword,
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'PATIENT',
        profile: {
          create: {
            phoneNumber: '+1234567892',
            dateOfBirth: new Date('1990-05-15'),
            gender: 'FEMALE',
            address: {
              create: {
                street: '123 Main St',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94102',
                country: 'USA',
              },
            },
            emergencyContact: {
              create: {
                name: 'John Doe',
                relationship: 'Spouse',
                phoneNumber: '+1234567893',
                email: 'john.doe@example.com',
              },
            },
          },
        },
      },
    });

    const patient = await prisma.patient.upsert({
      where: { userId: patientUser.id },
      update: {},
      create: {
        userId: patientUser.id,
        insuranceInfo: {
          create: {
            provider: 'Blue Cross Blue Shield',
            policyNumber: 'BC123456789',
            groupNumber: 'GRP001',
            effectiveDate: new Date('2023-01-01'),
            expirationDate: new Date('2024-12-31'),
          },
        },
      },
    });

    logger.info('Created sample patient');

    // Create sample appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const appointment = await prisma.appointment.upsert({
      where: { id: 'sample-appointment-id' },
      update: {},
      create: {
        id: 'sample-appointment-id',
        patientId: patient.id,
        providerId: provider.id,
        scheduledAt: tomorrow,
        duration: 60,
        type: 'CONSULTATION',
        status: 'SCHEDULED',
        reason: 'Annual checkup',
        notes: 'Patient requested annual physical examination',
      },
    });

    logger.info('Created sample appointment');

    // Create sample notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: patientUser.id,
          title: 'Appointment Reminder',
          message: 'You have an appointment tomorrow at 10:00 AM with Dr. Smith',
          type: 'APPOINTMENT_REMINDER',
          isRead: false,
        },
        {
          userId: providerUser.id,
          title: 'New Appointment',
          message: 'New appointment scheduled with Jane Doe for tomorrow at 10:00 AM',
          type: 'APPOINTMENT_CONFIRMED',
          isRead: false,
        },
      ],
    });

    logger.info('Created sample notifications');

    logger.info('Database seed completed successfully!');
    logger.info('Sample credentials:');
    logger.info('Admin: admin@mindcare.com / admin123');
    logger.info('Provider: dr.smith@mindcare.com / provider123');
    logger.info('Patient: jane.doe@example.com / patient123');

  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
