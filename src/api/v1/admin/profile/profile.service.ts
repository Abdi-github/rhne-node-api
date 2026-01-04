import bcrypt from "bcryptjs";
import { User } from "@models/user.model";
import { UserRole } from "@models/user-role.model";
import { ApiError } from "@shared/utils/api-error";

const SALT_ROUNDS = 12;

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId).populate("site_id", "name slug").lean();
  if (!user) throw ApiError.notFound("User");

  const userRoles = await UserRole.find({ user_id: userId }).populate("role_id", "name display_name").lean();

  return { ...user, roles: userRoles.map((ur) => ur.role_id) };
};

export const updateProfile = async (userId: string, data: Record<string, unknown>) => {
  const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true })
    .populate("site_id", "name slug")
    .lean();

  if (!user) throw ApiError.notFound("User");
  return user;
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await User.findById(userId).select("+password_hash");
  if (!user) throw ApiError.notFound("User");

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) throw ApiError.badRequest("Current password is incorrect");

  user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();

  return { message: "Password changed successfully" };
};
