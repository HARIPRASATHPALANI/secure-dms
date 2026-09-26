import crypto from 'crypto';
import { usersContainer } from '../config/database.js';

export class User {

  static async findByUsername(username) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.username = @username',
      parameters: [
        {
          name: '@username',
          value: username
        }
      ]
    };

    const { resources } = await usersContainer.items
      .query(querySpec)
      .fetchAll();

    return resources[0] || null;
  }

  static async findById(id) {
    const querySpec = {
      query: `
        SELECT *
        FROM c
        WHERE c.id = @id
      `,
      parameters: [
        {
          name: '@id',
          value: String(id)
        }
      ]
    };

    const { resources } = await usersContainer.items
      .query(querySpec)
      .fetchAll();

    return resources[0] || null;
  }

  static async getAll() {
    const querySpec = {
      query: `
        SELECT *
        FROM c
        ORDER BY c.created_at ASC
      `
    };

    const { resources } = await usersContainer.items
      .query(querySpec)
      .fetchAll();

    return resources;
  }

  static async create({
    username,
    password_hash,
    full_name,
    badge_number,
    role
  }) {

    const user = {
      id: crypto.randomUUID(),
      username,
      password_hash,
      full_name,
      badge_number,
      role,
      created_at: new Date().toISOString()
    };

    const { resource } = await usersContainer.items.create(user);

    return resource;
  }
}
