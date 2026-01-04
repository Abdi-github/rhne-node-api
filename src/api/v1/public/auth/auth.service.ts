import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "@config/env";
import { User } from "@models/user.model";
import { RefreshToken } from "@models/refresh-token.model";
import { UserRole } from "@models/user-role.model";
import { RolePermission } from "@models/role-permission.model";
import { Role } from "@models/role.model";
import { Permission } from "@models/permission.model";
import { ApiError } from "@shared/utils/api-error";
import { logger } from "@shared/utils/logger";
import { sendPasswordResetEmail } from "@config/mail";

// ── Token generation ──
const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
};

const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString("hex");
};

const parseExpiry = (expiry: string): number => {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s": return value * 1000;
    case "m": return value * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "d": return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
};

// ── Get user roles and permissions ──
const getUserRolesAndPermissions = async (userId: string) => {
  const userRoles = await UserRole.find({ user_id: userId }).lean();
  const roleIds = userRoles.map((ur) => ur.role_id);

  const roles = await Role.find({ _id: { $in: roleIds }, is_active: true }).lean();
  const roleNames = roles.map((r) => r.name);

  const rolePermissions = await RolePermission.find({ role_id: { $in: roleIds } }).lean();
  const permissionIds = rolePermissions.map((rp) => rp.permission_id);

  const permissions = await Permission.find({ _id: { $in: permissionIds }, is_active: true }).lean();
  const permissionNames = permissions.map((p) => p.name);

  return { roles: roleNames, permissions: permissionNames };
};

// ── Login ──
export const login = async (email: string, password: string, ip: string) => {
  // Find user with password_hash included
  const user = await User.findOne({ email, is_active: true })
    .select("+password_hash")
    .lean();


  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id.toString());
  const refreshTokenValue = generateRefreshToken();

  // Store refresh token in DB
  const expiresAt = new Date(Date.now() + parseExpiry(env.JWT_REFRESH_EXPIRY));
  await RefreshToken.create({
    user_id: user._id,
    token: refreshTokenValue,
    expires_at: expiresAt,
    created_by_ip: ip,
  });

  // Update last login
  await User.findByIdAndUpdate(user._id, { last_login_at: new Date() });

  // Get roles & permissions
  const { roles, permissions } = await getUserRolesAndPermissions(user._id.toString());

  // Return user data (without password_hash)
  const { password_hash: _pw, ...userData } = user;

  return {
    user: {
      ...userData,
      roles,
      permissions,
    },
    tokens: {
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      expires_in: env.JWT_ACCESS_EXPIRY,
    },
  };
};

// ── Refresh Token ──
export const refreshAccessToken = async (refreshTokenValue: string) => {
  const storedToken = await RefreshToken.findOne({
    token: refreshTokenValue,
    is_revoked: false,
  }).lean();

  if (!storedToken) {
    throw ApiError.unauthorized("Invalid or revoked refresh token");
  }

  if (new Date() > storedToken.expires_at) {
    // Revoke expired token
    await RefreshToken.findByIdAndUpdate(storedToken._id, { is_revoked: true });
    throw ApiError.unauthorized("Refresh token has expired");
  }

  // Check user still exists and is active
  const user = await User.findOne({ _id: storedToken.user_id, is_active: true }).lean();
  if (!user) {
    throw ApiError.unauthorized("User not found or inactive");
  }

  // Generate new access token
  const accessToken = generateAccessToken(user._id.toString());

  // Get roles & permissions
  const { roles, permissions } = await getUserRolesAndPermissions(user._id.toString());

  return {
    user: {
      ...user,
      roles,
      permissions,
    },
    tokens: {
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      expires_in: env.JWT_ACCESS_EXPIRY,
    },
  };
};

// ── Logout ──
export const logout = async (refreshTokenValue: string): Promise<void> => {
  const result = await RefreshToken.findOneAndUpdate(
    { token: refreshTokenValue, is_revoked: false },
    { is_revoked: true }
  );

  if (!result) {
    throw ApiError.badRequest("Invalid refresh token");
  }

  logger.info(`User logged out, refresh token revoked`);
};

// ── Forgot Password ──
export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email, is_active: true });

  if (!user) {
    // Don't reveal if email exists — always return success
    return;
  }

  // Generate reset token (a JWT with short expiry)
  const resetToken = jwt.sign(
    { userId: user._id.toString(), purpose: "password_reset" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "1h" }
  );

  // Send password reset email
  const emailSent = await sendPasswordResetEmail(email, resetToken, user.first_name);
  if (!emailSent) {
    logger.warn(`Failed to send password reset email to ${email}, logging token as fallback`);
  }
  logger.info(`Password reset requested for ${email}`);
};

// ── Reset Password ──
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
      purpose: string;
    };

    if (decoded.purpose !== "password_reset") {
      throw ApiError.badRequest("Invalid reset token");
    }

    const user = await User.findOne({
      _id: decoded.userId,
      is_active: true,
    });

    if (!user) {
      throw ApiError.notFound("User");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password_hash = passwordHash;
    await user.save();

    // Revoke all refresh tokens for this user
    await RefreshToken.updateMany(
      { user_id: user._id, is_revoked: false },
      { is_revoked: true }
    );

    logger.info(`Password reset successful for user ${user.email}`);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }
    throw error;
  }
};
