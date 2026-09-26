import crypto from 'crypto';
import {
  documentsContainer,
  usersContainer,
  casesContainer
} from '../config/database.js';

export class Document {

  static async findByCaseId(caseId) {
    const querySpec = {
      query: `
        SELECT *
        FROM c
        WHERE c.case_id = @case_id
        ORDER BY c.created_at DESC
      `,
      parameters: [
        {
          name: '@case_id',
          value: String(caseId)
        }
      ]
    };

    const { resources } = await documentsContainer.items
      .query(querySpec)
      .fetchAll();

    for (const document of resources) {
      const userQuery = {
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [
          {
            name: '@id',
            value: document.uploaded_by
          }
        ]
      };

      const { resources: users } = await usersContainer.items
        .query(userQuery)
        .fetchAll();

      document.uploader_name = users[0]?.full_name || null;
      document.uploader_role = users[0]?.role || null;
    }

    return resources;
  }

  static async findById(id) {
    const querySpec = {
      query: `
        SELECT *
        FROM c
        WHERE c.id = @id
        OR c.document_id = @document_id
      `,
      parameters: [
        {
          name: '@id',
          value: String(id)
        },
        {
          name: '@document_id',
          value: String(id)
        }
      ]
    };

    const { resources } =
      await documentsContainer.items.query(querySpec).fetchAll();

    if (!resources[0]) {
      return null;
    }

    const document = resources[0];

    const userQuery = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [
        {
          name: '@id',
          value: document.uploaded_by
        }
      ]
    };

    const { resources: users } =
      await usersContainer.items.query(userQuery).fetchAll();

    document.uploader_name = users[0]?.full_name || null;
    document.uploader_role = users[0]?.role || null;

    const caseQuery = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [
        {
          name: '@id',
          value: document.case_id
        }
      ]
    };

    const { resources: cases } =
      await casesContainer.items.query(caseQuery).fetchAll();

    if (cases[0]) {
      document.case_code = cases[0].case_id;
      document.case_name = cases[0].case_name;
    }

    return document;
  }

  static async create({
    document_id,
    case_id,
    title,
    document_type,
    file_name,
    original_name,
    file_path,
    file_size,
    mime_type,
    version,
    description,
    remarks,
    uploaded_by
  }) {
    const document = {
      id: crypto.randomUUID(),
      document_id,
      case_id: String(case_id),
      title,
      document_type,
      file_name,
      original_name,
      file_path,
      file_size,
      mime_type,
      version: version || 'v1.0',
      description: description || null,
      remarks: remarks || null,
      uploaded_by: String(uploaded_by),
      created_at: new Date().toISOString()
    };

    const { resource } =
      await documentsContainer.items.create(document);

    return resource;
  }
}
