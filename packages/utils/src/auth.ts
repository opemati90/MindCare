/**
 * Authentication utilities
 */

/**
 * Check if user has required role
 */
export const hasRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

/**
 * Check if user has any of the required roles
 */
export const hasAnyRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.some(role => role === userRole);
};

/**
 * Check if user is admin
 */
export const isAdmin = (userRole: string): boolean => {
  return hasAnyRole(userRole, ['ADMIN', 'SUPER_ADMIN']);
};

/**
 * Check if user is patient
 */
export const isPatient = (userRole: string): boolean => {
  return userRole === 'PATIENT';
};

/**
 * Check if user is provider
 */
export const isProvider = (userRole: string): boolean => {
  return userRole === 'PROVIDER';
};

/**
 * Get user display name
 */
export const getUserDisplayName = (user: { firstName: string; lastName: string }): string => {
  return `${user.firstName} ${user.lastName}`.trim();
};

/**
 * Get user initials
 */
export const getUserInitials = (user: { firstName: string; lastName: string }): string => {
  const firstInitial = user.firstName.charAt(0).toUpperCase();
  const lastInitial = user.lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Decode JWT token
 */
export const decodeToken = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const payload = decodeToken(token);
    return payload?.exp ? new Date(payload.exp * 1000) : null;
  } catch (error) {
    return null;
  }
};
