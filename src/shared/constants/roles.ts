export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  CONTENT_EDITOR: "content_editor",
  HR_MANAGER: "hr_manager",
  SITE_MANAGER: "site_manager",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * Roles that have admin panel access
 */
export const ADMIN_ROLES: RoleName[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.CONTENT_EDITOR,
  ROLES.HR_MANAGER,
  ROLES.SITE_MANAGER,
];
