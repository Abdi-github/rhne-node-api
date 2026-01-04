import { Role } from "@models/role.model";
import { Permission } from "@models/permission.model";
import { RolePermission } from "@models/role-permission.model";
import { UserRole } from "@models/user-role.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

export const getAll = async (options: PaginationOptions, isActive?: string) => {
  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: false,
    searchFields: ["name", "display_name.fr", "display_name.en"],
  });

  if (isActive !== undefined) filter.is_active = isActive === "true";

  const defaultSort =
    Object.keys(sort).length > 0 ? sort : ({ name: 1 } as Record<string, 1 | -1>);

  const [data, total] = await Promise.all([
    Role.find(filter).sort(defaultSort).skip(skip).limit(limit).lean(),
    Role.countDocuments(filter),
  ]);

  return { data, pagination: buildPagination(total, options) };
};

export const getById = async (id: string) => {
  const role = await Role.findById(id).lean();
  if (!role) throw ApiError.notFound("Role");

  // Load permissions assigned to this role
  const rolePermissions = await RolePermission.find({ role_id: id }).lean();
  const permissionIds = rolePermissions.map((rp) => rp.permission_id);
  const permissions = await Permission.find({ _id: { $in: permissionIds } })
    .sort({ resource: 1, action: 1 })
    .lean();

  return { ...role, permissions };
};

export const create = async (data: Record<string, unknown>) => {
  const name = data.name as string;

  const existing = await Role.findOne({ name });
  if (existing) throw ApiError.conflict("A role with this name already exists");

  const role = await Role.create(data);
  return role.toObject();
};

export const update = async (id: string, data: Record<string, unknown>) => {
  const role = await Role.findById(id);
  if (!role) throw ApiError.notFound("Role");

  // Prevent modifying system role names
  if (role.is_system && data.name && data.name !== role.name) {
    throw ApiError.badRequest("Cannot change the name of a system role");
  }

  if (data.name) {
    const existing = await Role.findOne({
      name: data.name as string,
      _id: { $ne: id },
    });
    if (existing) throw ApiError.conflict("A role with this name already exists");
  }

  const updated = await Role.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  return updated;
};

export const remove = async (id: string) => {
  const role = await Role.findById(id);
  if (!role) throw ApiError.notFound("Role");

  if (role.is_system) {
    throw ApiError.badRequest("Cannot delete a system role");
  }

  // Check if any users are assigned to this role
  const assignedUsers = await UserRole.countDocuments({ role_id: id });
  if (assignedUsers > 0) {
    throw ApiError.badRequest(
      `Cannot delete role: ${assignedUsers} user(s) are currently assigned to it`
    );
  }

  // Remove role-permission assignments
  await RolePermission.deleteMany({ role_id: id });

  // Delete the role
  await Role.findByIdAndDelete(id);
};

export const assignPermissions = async (
  roleId: string,
  permissionIds: string[]
) => {
  const role = await Role.findById(roleId);
  if (!role) throw ApiError.notFound("Role");

  // Validate all permission IDs exist
  const permissions = await Permission.find({
    _id: { $in: permissionIds },
  }).lean();

  if (permissions.length !== permissionIds.length) {
    throw ApiError.badRequest("One or more permission IDs are invalid");
  }

  // Replace all role-permission assignments (delete old, insert new)
  await RolePermission.deleteMany({ role_id: roleId });

  if (permissionIds.length > 0) {
    const assignments = permissionIds.map((permissionId) => ({
      role_id: roleId,
      permission_id: permissionId,
    }));
    await RolePermission.insertMany(assignments);
  }

  // Return updated role with permissions
  return getById(roleId);
};
