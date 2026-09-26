import { Case } from '../models/Case.js';
import { AuditLog } from '../models/AuditLog.js';

export const getCases = async (req, res, next) => {
  try {
    const { search, case_type, status } = req.query;
    const cases = await Case.findAll({ search, case_type, status });
    return res.status(200).json({ success: true, count: cases.length, cases });
  } catch (err) {
    next(err);
  }
};

export const getCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const caseData = await Case.findById(id);

    if (!caseData) {
      return res.status(404).json({ success: false, error: 'Case not found.' });
    }

    return res.status(200).json({ success: true, case: caseData });
  } catch (err) {
    next(err);
  }
};

export const createCase = async (req, res, next) => {
  try {
    const { case_id, case_name, case_type, status, priority, location, description } = req.body;

    if (!case_name || !case_type || !status || !priority || !location) {
      return res.status(400).json({ success: false, error: 'Missing required case metadata fields.' });
    }

    // Auto generate case ID if missing
    let finalCaseId = case_id;
    if (!finalCaseId) {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      finalCaseId = `CASE-${year}-${random}`;
    }

    // Check for duplicate Case ID
    const existing = await Case.findByCaseId(finalCaseId);
    if (existing) {
      return res.status(400).json({ success: false, error: `Case ID '${finalCaseId}' already exists. Please choose a unique Case ID.` });
    }

    const newId = await Case.create({
      case_id: finalCaseId,
      case_name,
      case_type,
      status,
      priority,
      location,
      description,
      created_by: req.user.id
    });

    await AuditLog.log({
      user_id: req.user.id,
      action: 'CASE_CREATE',
      entity: 'Case',
      details: { caseId: finalCaseId, caseName: case_name, caseType: case_type },
      ip_address: req.ip
    });

    const createdCase = await Case.findById(newId);

    return res.status(201).json({
      success: true,
      case: createdCase,
      message: 'New case created successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const metrics = await Case.getMetrics();
    return res.status(200).json({ success: true, metrics });
  } catch (err) {
    next(err);
  }
};
