import type { Request, Response, NextFunction } from "express";
import { UserRole } from "@models/user-role.model";
import { RolePermission } from "@models/role-permission.model";
import { Role } from "@models/role.model";
import { Permission } from "@models/permission.model";
import { ApiError } from "@shared/utils/api-error";

/**
 * Load user roles and permissions into req object.
 * Must be used AFTER authenticate middleware.
 */
export const loadUserPermissions = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw ApiError.unauthorized("Authentication required");
    }

    // Get user's role assignments
    const userRoles = await UserRole.find({ user_id: req.userId }).lean();
    const roleIds = userRoles.map((ur) => ur.role_id);

    // Get role names
    const roles = await Role.find({
      _id: { $in: roleIds },
      is_active: true,
    }).lean();
    req.userRoles = roles.map((r) => r.name);

    // Get permission IDs for these roles
    const rolePermissions = await RolePermission.find({
      role_id: { $in: roleIds },
    }).lean();
    const permissionIds = rolePermissions.map((rp) => rp.permission_id);

    // Get permission names
    const permissions = await Permission.find({
      _id: { $in: permissionIds },
      is_active: true,
    }).lean();
    req.userPermissions = permissions.map((p) => p.name);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has at least one of the required roles.
 */
export const requireRoles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userRoles || req.userRoles.length === 0) {
      next(ApiError.forbidden("No roles assigned"));
      return;
    }

    const hasRole = roles.some((role) => req.userRoles!.includes(role));

    if (!hasRole) {
      next(ApiError.forbidden("Insufficient role privileges"));
      return;
    }

    next();
  };
};

/**
 * Check if user has at least one of the required permissions.
 */
export const requirePermissions = (...permissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userPermissions || req.userPermissions.length === 0) {
      next(ApiError.forbidden("No permissions assigned"));
      return;
    }

    // Super admins bypass permission checks
    if (req.userRoles?.includes("super_admin")) {
      next();
      return;
    }

    const hasPermission = permissions.some((perm) =>
      req.userPermissions!.includes(perm)
    );

    if (!hasPermission) {
      next(ApiError.forbidden("Insufficient permissions"));
      return;
    }

    next();
  };
};
