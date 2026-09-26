import crypto from 'crypto';
import { auditLogsContainer } from '../config/database.js';

export class SecurityAlert {

  static async create({
    username,
    module_name,
    attempt_count,
    ip_address,
    telegram_sent
  }) {
    const alert = {
      id: crypto.randomUUID(),
      type: 'SECURITY_ALERT',
      username,
      module_name,
      attempt_count,
      ip_address: ip_address || '127.0.0.1',
      telegram_sent: Boolean(telegram_sent),
      timestamp: new Date().toISOString()
    };

    const { resource } =
      await auditLogsContainer.items.create(alert);

    return resource;
  }

  static async getRecent() {
    const querySpec = {
      query: `
        SELECT TOP 20 *
        FROM c
        WHERE c.type = @type
        ORDER BY c.timestamp DESC
      `,
      parameters: [
        {
          name: '@type',
          value: 'SECURITY_ALERT'
        }
      ]
    };

    const { resources } =
      await auditLogsContainer.items
        .query(querySpec)
        .fetchAll();

    return resources;
  }
}
