import type { UserRole } from '../../users/user-role.enum.js';

export type AuthenticatedUser = {
  id: number;
  email: string;
  role: UserRole;
};
