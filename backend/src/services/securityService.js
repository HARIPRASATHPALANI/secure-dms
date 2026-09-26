import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { SecurityAlert } from '../models/SecurityAlert.js';
import { AuditLog } from '../models/AuditLog.js';
import { TelegramService } from './telegramService.js';
import { config } from '../config/env.js';

// In-memory attempt store keyed by `${username}_${moduleName}`
const attemptTracker = new Map();

export class SecurityService {
  static getAttemptCount(key) {
    return attemptTracker.get(key) || 0;
  }

  static incrementAttempt(key) {
    const current = SecurityService.getAttemptCount(key);
    const updated = current + 1;
    attemptTracker.set(key, updated);
    return updated;
  }

  static resetAttempt(key) {
    attemptTracker.delete(key);
  }

  static async handleFailedPrimaryLogin({ username, clientIp }) {
    const trackerKey = `primary_login_${username}`;
    const attemptCount = SecurityService.incrementAttempt(trackerKey);
    const timestamp = new Date().toISOString();

    if (attemptCount === 1) {
      return { attemptCount: 1, remainingAttempts: 1, alertTriggered: false };
    }

    // 2 failed primary logins -> trigger Telegram alert
    SecurityService.resetAttempt(trackerKey);

    const telegramRes = await TelegramService.sendSecurityAlert({
      username: username || 'Unknown User',
      moduleName: 'PRIMARY_LOGIN',
      attemptCount: 2,
      ipAddress: clientIp,
      timestamp
    });

    await SecurityAlert.create({
      username: username || 'Unknown User',
      module_name: 'PRIMARY_LOGIN',
      attempt_count: 2,
      ip_address: clientIp,
      telegram_sent: telegramRes.success
    });

    await AuditLog.log({
      action: 'PRIMARY_LOGIN_FAILED_LOCKOUT',
      entity: 'Security',
      details: {
        attemptedUsername: username,
        attemptCount: 2,
        telegramAlertSent: telegramRes.success,
        status: 'Suspicious Primary Login Attempt Alerted'
      },
      ip_address: clientIp
    });

    return { attemptCount: 2, remainingAttempts: 0, alertTriggered: true };
  }

  static async verifyReAuthentication({ username, password, moduleName, clientIp, currentUserId }) {
    const trackerKey = `${username}_${moduleName}`;
    const user = await User.findByUsername(username);

    // Check credentials
    let isValid = false;
    if (user) {
      isValid = await bcrypt.compare(password, user.password_hash);
    }

    if (isValid) {
      // Reset attempt counter on success
      SecurityService.resetAttempt(trackerKey);

      // Generate short-lived (15 min) re-authentication token
      const reauthToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role, verifiedModule: moduleName },
        config.jwtSecret,
        { expiresIn: '15m' }
      );

      await AuditLog.log({
        user_id: user.id,
        action: 'REAUTH_SUCCESS',
        entity: 'Security',
        details: { moduleName, message: 'Secondary authentication verified successfully.' },
        ip_address: clientIp
      });

      return {
        success: true,
        reauthToken,
        message: 'Secondary authentication successful. Access granted.'
      };
    }

    // Invalid Credentials handling
    const attemptCount = SecurityService.incrementAttempt(trackerKey);
    const timestamp = new Date().toISOString();

    if (attemptCount === 1) {
      await AuditLog.log({
        user_id: currentUserId || null,
        action: 'REAUTH_FAILED_ATTEMPT_1',
        entity: 'Security',
        details: { attemptedUsername: username, moduleName, attemptCount: 1 },
        ip_address: clientIp
      });

      return {
        success: false,
        attemptCount: 1,
        remainingAttempts: 1,
        message: 'Invalid credentials. 1 attempt remaining.'
      };
    }

    // Attempt 2 or greater: Suspicious access threshold reached!
    SecurityService.resetAttempt(trackerKey);

    // Send Telegram alert
    const telegramRes = await TelegramService.sendSecurityAlert({
      username,
      moduleName,
      attemptCount: 2,
      ipAddress: clientIp,
      timestamp
    });

    // Record Security Alert to Database
    await SecurityAlert.create({
      username,
      module_name: moduleName,
      attempt_count: 2,
      ip_address: clientIp,
      telegram_sent: telegramRes.success
    });

    // Record Audit Log
    await AuditLog.log({
      user_id: currentUserId || null,
      action: 'REAUTH_FAILED_LOCKOUT',
      entity: 'Security',
      details: {
        attemptedUsername: username,
        moduleName,
        attemptCount: 2,
        telegramAlertSent: telegramRes.success,
        status: 'Suspicious Login Attempt Alerted'
      },
      ip_address: clientIp
    });

    return {
      success: false,
      attemptCount: 2,
      remainingAttempts: 0,
      alertTriggered: true,
      message: 'SECURITY ALERT: Two failed re-authentication attempts detected. Incident dispatched to Administrator.'
    };
  }
}

