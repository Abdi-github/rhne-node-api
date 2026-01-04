import bcrypt from "bcryptjs";
import { User } from "@models/user.model";
import { UserRole } from "@models/user-role.model";
import { Role } from "@models/role.model";
import { buildQuery } from "@shared/utils/query-builder";
import { buildPagination } from "@shared/utils/pagination";
import { ApiError } from "@shared/utils/api-error";
import type { PaginationOptions } from "@shared/types/common.types";

const SALT_ROUNDS = 12;

export const getAll = async (options: PaginationOptions, isActive?: string) => {
  const { filter, sort, skip, limit } = buildQuery({
    ...options,
    activeOnly: false,
    searchFields: ["first_name", "last_name", "email"],
  });

  if (isActive !== undefined) filter.is_active = isActive === "true";

  const [data, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit).populate("site_id", "name slug").lean(),
    User.countDocuments(filter),
  ]);

  // Attach roles for each user
  const userIds = data.map((u) => u._id);
  const userRoles = await UserRole.find({ user_id: { $in: userIds } }).populate("role_id", "name display_name").lean();

  const rolesByUser = new Map<string, unknown[]>();
  for (const ur of userRoles) {
    const uid = ur.user_id.toString();
    if (!rolesByUser.has(uid)) rolesByUser.set(uid, []);
    rolesByUser.get(uid)!.push(ur.role_id);
  }

  const enriched = data.map((u) => ({
    ...u,
    roles: rolesByUser.get(u._id.toString()) || [],
  }));

  return { data: enriched, pagination: buildPagination(total, options) };
};

export const getById = async (id: string) => {
  const user = await User.findById(id).populate("site_id", "name slug").lean();
  if (!user) throw ApiError.notFound("User");

  const userRoles = await UserRole.find({ user_id: id }).populate("role_id", "name display_name").lean();
  return { ...user, roles: userRoles.map((ur) => ur.role_id) };
};

export const create = async (data: Record<string, unknown>) => {
  const { password, roles, ...userData } = data as {
    password: string;
    roles?: string[];
    [key: string]: unknown;
  };

  // Check duplicate email
  const existing = await User.findOne({ email: userData.email });
  if (existing) throw ApiError.conflict("A user with this email already exists");

  // Hash password
  userData.password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create(userData);

  // Assign roles if provided
  if (roles && roles.length > 0) {
    const validRoles = await Role.find({ _id: { $in: roles } });
    if (validRoles.length !== roles.length) throw ApiError.badRequest("One or more invalid role IDs");

    const userRoleDocs = roles.map((roleId) => ({
      user_id: user._id,
      role_id: roleId,
    }));
    await UserRole.insertMany(userRoleDocs);
  }

  return getById(user._id.toString());
};

export const update = async (id: string, data: Record<string, unknown>) => {
  const { password, roles, ...userData } = data as {
    password?: string;
    roles?: string[];
    [key: string]: unknown;
  };

  // Check user exists
  const existingUser = await User.findById(id);
  if (!existingUser) throw ApiError.notFound("User");

  // Check email uniqueness
  if (userData.email) {
    const emailExists = await User.findOne({ email: userData.email, _id: { $ne: id } });
    if (emailExists) throw ApiError.conflict("A user with this email already exists");
  }

  // Hash password if provided
  if (password) {
    userData.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  const user = await User.findByIdAndUpdate(id, userData, { new: true, runValidators: true }).lean();
  if (!user) throw ApiError.notFound("User");

  // Update roles if provided
  if (roles) {
    const validRoles = await Role.find({ _id: { $in: roles } });
    if (validRoles.length !== roles.length) throw ApiError.badRequest("One or more invalid role IDs");

    await UserRole.deleteMany({ user_id: id });
    if (roles.length > 0) {
      const userRoleDocs = roles.map((roleId) => ({
        user_id: id,
        role_id: roleId,
      }));
      await UserRole.insertMany(userRoleDocs);
    }
  }

  return getById(id);
};

export const softDelete = async (id: string) => {
  const user = await User.findByIdAndUpdate(id, { is_active: false }, { new: true }).lean();
  if (!user) throw ApiError.notFound("User");
  return user;
};

export const assignRoles = async (userId: string, roleIds: string[]) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User");

  const validRoles = await Role.find({ _id: { $in: roleIds } });
  if (validRoles.length !== roleIds.length) throw ApiError.badRequest("One or more invalid role IDs");

  await UserRole.deleteMany({ user_id: userId });
  const userRoleDocs = roleIds.map((roleId) => ({
    user_id: userId,
    role_id: roleId,
  }));
  await UserRole.insertMany(userRoleDocs);

  return getById(userId);
};
