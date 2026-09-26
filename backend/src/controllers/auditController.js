import { AuditLog } from '../models/AuditLog.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.getAll(100);
    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
};
