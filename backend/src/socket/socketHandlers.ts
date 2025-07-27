import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import type { JWTPayload } from '@mindcare/shared-types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const setupSocketHandlers = (io: SocketIOServer) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      
      // Verify user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return next(new Error('Invalid or inactive user'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      
      next();
    } catch (error) {
      logger.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info('User connected via WebSocket', {
      userId: socket.userId,
      socketId: socket.id,
    });

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      
      // Join role-specific rooms
      if (socket.userRole) {
        socket.join(`role:${socket.userRole}`);
      }
    }

    // Handle appointment updates
    socket.on('appointment:subscribe', (appointmentId: string) => {
      socket.join(`appointment:${appointmentId}`);
      logger.debug('User subscribed to appointment updates', {
        userId: socket.userId,
        appointmentId,
      });
    });

    socket.on('appointment:unsubscribe', (appointmentId: string) => {
      socket.leave(`appointment:${appointmentId}`);
      logger.debug('User unsubscribed from appointment updates', {
        userId: socket.userId,
        appointmentId,
      });
    });

    // Handle chat messages (for future implementation)
    socket.on('chat:join', (roomId: string) => {
      socket.join(`chat:${roomId}`);
      logger.debug('User joined chat room', {
        userId: socket.userId,
        roomId,
      });
    });

    socket.on('chat:leave', (roomId: string) => {
      socket.leave(`chat:${roomId}`);
      logger.debug('User left chat room', {
        userId: socket.userId,
        roomId,
      });
    });

    socket.on('chat:message', async (data: { roomId: string; message: string }) => {
      try {
        // Validate and save message to database
        // Emit to all users in the chat room
        socket.to(`chat:${data.roomId}`).emit('chat:message', {
          id: Date.now().toString(),
          userId: socket.userId,
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Error handling chat message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('chat:typing', (data: { roomId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.roomId}`).emit('chat:typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('User disconnected from WebSocket', {
        userId: socket.userId,
        socketId: socket.id,
        reason,
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error:', {
        userId: socket.userId,
        socketId: socket.id,
        error,
      });
    });
  });

  return io;
};

// Helper functions to emit events from other parts of the application
export const emitToUser = (io: SocketIOServer, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
  logger.debug('Event emitted to user', { userId, event });
};

export const emitToRole = (io: SocketIOServer, role: string, event: string, data: any) => {
  io.to(`role:${role}`).emit(event, data);
  logger.debug('Event emitted to role', { role, event });
};

export const emitToAppointment = (io: SocketIOServer, appointmentId: string, event: string, data: any) => {
  io.to(`appointment:${appointmentId}`).emit(event, data);
  logger.debug('Event emitted to appointment', { appointmentId, event });
};

export const emitToChat = (io: SocketIOServer, roomId: string, event: string, data: any) => {
  io.to(`chat:${roomId}`).emit(event, data);
  logger.debug('Event emitted to chat room', { roomId, event });
};
