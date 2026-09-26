import crypto from 'crypto';

import {
  casesContainer,
  usersContainer,
  documentsContainer,
  auditLogsContainer
} from '../config/database.js';

export class Case {

  // Get all cases with optional filters
  static async findAll({ search, case_type, status }) {
    let query = 'SELECT * FROM c WHERE 1=1';
    const parameters = [];

    if (search) {
      query += `
        AND (
          CONTAINS(LOWER(c.case_id), LOWER(@search))
          OR CONTAINS(LOWER(c.case_name), LOWER(@search))
          OR CONTAINS(LOWER(c.description), LOWER(@search))
          OR CONTAINS(LOWER(c.location), LOWER(@search))
        )
      `;

      parameters.push({
        name: '@search',
        value: search
      });
    }

    if (case_type) {
      query += ' AND c.case_type = @case_type';

      parameters.push({
        name: '@case_type',
        value: case_type
      });
    }

    if (status) {
      query += ' AND c.status = @status';

      parameters.push({
        name: '@status',
        value: status
      });
    }

    query += ' ORDER BY c.created_at DESC';

    const { resources } = await casesContainer.items
      .query({
        query,
        parameters
      })
      .fetchAll();

    // Add creator name and document count
    for (const item of resources) {

      const userQuery = {
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [
          {
            name: '@id',
            value: item.created_by
          }
        ]
      };

      const { resources: users } =
        await usersContainer.items
          .query(userQuery)
          .fetchAll();

      item.creator_name = users[0]?.full_name || null;

      const documentQuery = {
        query: `
          SELECT VALUE COUNT(1)
          FROM c
          WHERE c.case_id = @case_id
        `,
        parameters: [
          {
            name: '@case_id',
            value: item.id
          }
        ]
      };

      const { resources: count } =
        await documentsContainer.items
          .query(documentQuery)
          .fetchAll();

      item.document_count = count[0] || 0;
    }

    return resources;
  }


  // Find case by Cosmos ID or case ID
  static async findById(id) {
    const querySpec = {
      query: `
        SELECT *
        FROM c
        WHERE c.id = @id
        OR c.case_id = @case_id
      `,
      parameters: [
        {
          name: '@id',
          value: String(id)
        },
        {
          name: '@case_id',
          value: String(id)
        }
      ]
    };

    const { resources } =
      await casesContainer.items
        .query(querySpec)
        .fetchAll();

    if (!resources[0]) {
      return null;
    }

    const item = resources[0];

    // Get creator information
    const userQuery = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [
        {
          name: '@id',
          value: item.created_by
        }
      ]
    };

    const { resources: users } =
      await usersContainer.items
        .query(userQuery)
        .fetchAll();

    item.creator_name = users[0]?.full_name || null;

    return item;
  }


  // Find case using CASE-XXXX ID
  static async findByCaseId(case_id) {
    const querySpec = {
      query: `
        SELECT *
        FROM c
        WHERE c.case_id = @case_id
      `,
      parameters: [
        {
          name: '@case_id',
          value: case_id
        }
      ]
    };

    const { resources } =
      await casesContainer.items
        .query(querySpec)
        .fetchAll();

    return resources[0] || null;
  }


  // Create new case
  static async create({
    case_id,
    case_name,
    case_type,
    status,
    priority,
    location,
    description,
    created_by
  }) {

    const caseItem = {
      id: crypto.randomUUID(),

      case_id,
      case_name,
      case_type,
      status,
      priority,
      location,

      description: description || null,

      created_by: String(created_by),

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { resource } =
      await casesContainer.items.create(caseItem);

    return resource;
  }


  // Dashboard metrics
  static async getMetrics() {

    // Total cases
    const totalCasesQuery = {
      query: 'SELECT VALUE COUNT(1) FROM c'
    };

    const { resources: totalCases } =
      await casesContainer.items
        .query(totalCasesQuery)
        .fetchAll();


    // Total documents
    const totalDocsQuery = {
      query: 'SELECT VALUE COUNT(1) FROM c'
    };

    const { resources: totalDocs } =
      await documentsContainer.items
        .query(totalDocsQuery)
        .fetchAll();


    // Five most recent cases
    const recentCasesQuery = {
      query: `
        SELECT TOP 5 *
        FROM c
        ORDER BY c.created_at DESC
      `
    };

    const { resources: recentCases } =
      await casesContainer.items
        .query(recentCasesQuery)
        .fetchAll();


    // Five most recent security alerts
    // Security alerts are stored in AuditLogs
    // with type = SECURITY_ALERT
    const recentAlertsQuery = {
      query: `
        SELECT TOP 5 *
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

    const { resources: recentAlerts } =
      await auditLogsContainer.items
        .query(recentAlertsQuery)
        .fetchAll();


    return {
      totalCases: totalCases[0] || 0,
      totalDocuments: totalDocs[0] || 0,
      recentCases,
      recentAlerts
    };
  }
}
