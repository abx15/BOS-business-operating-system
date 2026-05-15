import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { logger } from '../../utils/logger';
import type { LoginInput, RefreshInput } from './auth.schema';

export const authService = {

  async login(input: LoginInput) {
    // 1. Find user by email (not deleted)
    const user = await prisma.user.findFirst({
      where: {
        email: input.email,
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        companyId: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // 2. Compare password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // 3. Build JWT payload
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    // 4. Generate tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 5. Save refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    logger.info({ userId: user.id, role: user.role }, 'User logged in');

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    };
  },

  async refresh(input: RefreshInput) {
    // 1. Verify refresh token signature
    let payload;
    try {
      payload = verifyRefreshToken(input.refreshToken);
    } catch {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // 2. Check token matches DB (rotation check)
    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        refreshToken: input.refreshToken,
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        companyId: true,
      },
    });

    if (!user) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // 3. Generate new tokens (rotation)
    const newPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    // 4. Save new refresh token, invalidate old
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    logger.info({ userId: user.id }, 'Token refreshed');

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    logger.info({ userId }, 'User logged out');
  },
};
