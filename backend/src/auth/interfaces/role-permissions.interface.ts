import { Role } from '../enums/role.enum';
import { Permission } from '../enums/permission.enum';

export const ROLE_PERMISSIONS = {
  [Role.ADMIN]: Object.values(Permission), // Toutes les permissions
  [Role.ORGANIZER]: [
    Permission.READ_EVENTS,
    Permission.CREATE_EVENTS,
    Permission.UPDATE_EVENTS,
    Permission.READ_USERS,
  ],
  [Role.PARTICIPANT]: [Permission.READ_EVENTS],
} as const;
