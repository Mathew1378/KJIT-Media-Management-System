import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

/**
 * Hash a raw token with SHA-256 before storing or looking up in the database.
 * Only the hash is stored in the database to prevent token leakage in dumps.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Generate a cryptographically secure random token (64 hex characters = 256 bits entropy)
 * and persist its hash with a time-limited expiration.
 * Any prior unconsumed tokens for this user are invalidated.
 */
export async function createPasswordResetToken(
  userId: string,
  expiresInHours = 24
): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  // Invalidate any previous unused reset tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId,
      usedAt: null,
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}

export interface TokenVerificationResult {
  valid: boolean;
  error?: string;
  tokenRecord?: {
    id: string;
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    usedAt: Date | null;
  };
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    department: string;
    isActive: boolean;
  };
}

/**
 * Verify a password reset token without consuming it.
 * Verifies existence, expiration, single-use status, and account active state.
 */
export async function verifyPasswordResetToken(
  rawToken: string
): Promise<TokenVerificationResult> {
  if (!rawToken || typeof rawToken !== 'string') {
    return { valid: false, error: 'Password reset token is missing.' };
  }

  const tokenHash = hashToken(rawToken);

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          department: true,
          isActive: true,
        },
      },
    },
  });

  if (!tokenRecord) {
    return {
      valid: false,
      error: 'Invalid or expired password reset link.',
    };
  }

  if (tokenRecord.usedAt) {
    return {
      valid: false,
      error: 'This password reset link has already been used.',
    };
  }

  if (new Date() > tokenRecord.expiresAt) {
    return {
      valid: false,
      error: 'This password reset link has expired. Please contact your administrator to request a new link.',
    };
  }

  if (!tokenRecord.user.isActive) {
    return {
      valid: false,
      error: 'This account has been deactivated. Please contact the administrator.',
    };
  }

  return {
    valid: true,
    tokenRecord,
    user: tokenRecord.user,
  };
}

/**
 * Consume a password reset token, updating the user's passwordHash and marking the token used.
 * The old password hash is permanently replaced, making the initial default password unusable.
 */
export async function consumePasswordResetToken(
  rawToken: string,
  newPassword: string
): Promise<{ success: boolean; error?: string; user?: { id: string; email: string; name: string; role: string } }> {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const verification = await verifyPasswordResetToken(rawToken);
  if (!verification.valid || !verification.tokenRecord || !verification.user) {
    return { success: false, error: verification.error || 'Invalid or expired password reset link.' };
  }

  const { tokenRecord, user } = verification;
  const newPasswordHash = hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        id: { not: tokenRecord.id },
      },
    }),
  ]);

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}
