import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. Authentication token missing.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User associated with token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired session token. Please log in again.' });
  }
};

export const requireReAuthToken = (targetModule) => {
  return (req, res, next) => {
    const reauthToken = req.headers['x-reauth-token'];
    if (!reauthToken) {
      return res.status(403).json({
        success: false,
        error: `Secondary re-authentication required to access the ${targetModule} module.`
      });
    }

    try {
      const decoded = jwt.verify(reauthToken, config.jwtSecret);
      if (decoded.verifiedModule !== targetModule) {
        return res.status(403).json({
          success: false,
          error: `Re-authentication token invalid for ${targetModule} module.`
        });
      }

      req.reauthVerified = true;
      next();
    } catch (err) {
      return res.status(403).json({
        success: false,
        error: 'Secondary re-authentication token has expired or is invalid. Please verify credentials again.'
      });
    }
  };
};

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access restricted. Role '${req.user ? req.user.role : 'UNKNOWN'}' is not authorized for this operation.`
      });
    }
    next();
  };
};
