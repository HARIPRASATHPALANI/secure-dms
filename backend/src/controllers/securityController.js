import { SecurityService } from '../services/securityService.js';

export const verifyReAuth = async (req, res, next) => {
  try {
    const { username, password, moduleName } = req.body;

    if (!username || !password || !moduleName) {
      return res.status(400).json({
        success: false,
        error: 'Username, password, and moduleName are required for secondary re-authentication.'
      });
    }

    if (!['UPDATE', 'NEW_CASE'].includes(moduleName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid target module specified for re-authentication.'
      });
    }

    const currentUserId = req.user ? req.user.id : null;
    const clientIp = req.ip || '127.0.0.1';

    const result = await SecurityService.verifyReAuthentication({
      username,
      password,
      moduleName,
      clientIp,
      currentUserId
    });

    if (!result.success) {
      const statusCode = result.alertTriggered ? 403 : 401;
      return res.status(statusCode).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
