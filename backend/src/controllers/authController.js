import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { SecurityService } from '../services/securityService.js';
import { config } from '../config/env.js';

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      const secRes = await SecurityService.handleFailedPrimaryLogin({ username, clientIp: req.ip });
      await AuditLog.log({
        action: 'LOGIN_FAILED',
        entity: 'User',
        details: { username, reason: 'Username not found', attemptCount: secRes.attemptCount },
        ip_address: req.ip
      });

      const msg = secRes.alertTriggered
        ? 'SECURITY ALERT: Two failed login attempts detected. Incident alert sent to Administrator via Telegram.'
        : 'Invalid username or password.';

      return res.status(401).json({ success: false, error: msg, attemptCount: secRes.attemptCount });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const secRes = await SecurityService.handleFailedPrimaryLogin({ username, clientIp: req.ip });
      await AuditLog.log({
        user_id: user.id,
        action: 'LOGIN_FAILED',
        entity: 'User',
        details: { username, reason: 'Invalid password', attemptCount: secRes.attemptCount },
        ip_address: req.ip
      });

      const msg = secRes.alertTriggered
        ? 'SECURITY ALERT: Two failed login attempts detected. Incident alert sent to Administrator via Telegram.'
        : 'Invalid username or password.';

      return res.status(401).json({ success: false, error: msg, attemptCount: secRes.attemptCount });
    }

    // Success -> reset login attempts
    SecurityService.resetAttempt(`primary_login_${username}`);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, badge: user.badge_number },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    await AuditLog.log({
      user_id: user.id,
      action: 'LOGIN_SUCCESS',
      entity: 'User',
      details: { username: user.username, role: user.role },
      ip_address: req.ip
    });

    const userProfile = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      badgeNumber: user.badge_number,
      role: user.role
    };

    return res.status(200).json({
      success: true,
      token,
      user: userProfile,
      message: 'Authentication successful.'
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await AuditLog.log({
        user_id: req.user.id,
        action: 'LOGOUT',
        entity: 'User',
        details: { username: req.user.username },
        ip_address: req.ip
      });
    }
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        fullName: req.user.full_name,
        badgeNumber: req.user.badge_number,
        role: req.user.role
      }
    });
  } catch (err) {
    next(err);
  }
};
