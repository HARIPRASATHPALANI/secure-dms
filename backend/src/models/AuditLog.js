import crypto from 'crypto';
import {
  auditLogsContainer,
  usersContainer
} from '../config/database.js';

export class AuditLog {

  static async log({
    user_id,
    action,
    entity,
    details,
    ip_address
  }) {
    const auditLog = {
      id: crypto.randomUUID(),
      user_id: user_id ? String(user_id) : null,
      action,
      entity,
      details:
        typeof details === 'object'
          ? JSON.stringify(details)
          : details || null,
      ip_address: ip_address || '127.0.0.1',
      timestamp: new Date().toISOString()
    };

    const { resource } =
      await auditLogsContainer.items.create(auditLog);

    return resource;
  }

  static async getAll(limit = 50) {
    const querySpec = {
      query: `
        SELECT TOP ${Number(limit)} *
        FROM c
        ORDER BY c.timestamp DESC
      `
    };

    const { resources } =
      await auditLogsContainer.items.query(querySpec).fetchAll();

    for (const log of resources) {
      if (!log.user_id) {
        continue;
      }

      const userQuery = {
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [
          {
            name: '@id',
            value: log.user_id
          }
        ]
      };

      const { resources: users } =
        await usersContainer.items.query(userQuery).fetchAll();

      if (users[0]) {
        log.username = users[0].username;
        log.full_name = users[0].full_name;
        log.role = users[0].role;
      }
    }

    return resources;
  }
}
