import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { apiClient } from './api-client';
import type { LoginRequest, LoginResponse } from '@mindcare/shared-types';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const loginData: LoginRequest = {
            email: credentials.email,
            password: credentials.password,
            rememberMe: credentials.rememberMe === 'true',
          };

          const response = await apiClient.post<LoginResponse>('/auth/login', loginData);

          if (response.data.success && response.data.data) {
            const { user, accessToken, refreshToken } = response.data.data;
            
            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
              accessToken,
              refreshToken,
            };
          }

          return null;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Authentication failed';
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          userId: user.id,
        };
      }

      // Return previous token if the access token has not expired yet
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        user: {
          ...session.user,
          id: token.userId,
          role: token.role,
        },
      };
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('User signed in:', { userId: user.id, email: user.email });
    },
    async signOut({ token }) {
      console.log('User signed out:', { userId: token.userId });
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
