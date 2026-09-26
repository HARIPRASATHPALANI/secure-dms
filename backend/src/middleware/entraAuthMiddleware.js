import { createRemoteJWKSet, jwtVerify } from 'jose';
import { config } from '../config/env.js';
import { usersContainer } from '../config/database.js';

const tenantId = config.entraTenantId;
const audience = config.entraApiAudience;

const allowedIssuers = [
  `https://login.microsoftonline.com/${tenantId}/v2.0`,
  `https://sts.windows.net/${tenantId}/`
];

const jwks = createRemoteJWKSet(
  new URL(
    `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`
  )
);

export const authenticateEntraToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Entra ID access token missing.'
    });
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      audience
    });

    if (!allowedIssuers.includes(payload.iss)) {
      console.error('Invalid Entra issuer:', payload.iss);

      return res.status(401).json({
        success: false,
        error: 'Invalid Entra ID token issuer.'
      });
    }

    req.entraUser = payload;

    const entraObjectId = payload.oid;

    if (!entraObjectId) {
      return res.status(401).json({
        success: false,
        error: 'Entra ID user object ID missing.'
      });
    }

    const querySpec = {
      query: 'SELECT * FROM c WHERE c.entra_object_id = @entraObjectId',
      parameters: [
        {
          name: '@entraObjectId',
          value: entraObjectId
        }
      ]
    };

    const { resources } = await usersContainer.items
      .query(querySpec)
      .fetchAll();

    const user = resources[0];

    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'Entra user is not mapped to an application user.'
      });
    }

    req.user = user;

    next();

  } catch (err) {
    console.error(
      'Entra token validation failed:',
      err.code || '',
      err.message
    );

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired Entra ID access token.'
    });
  }
};
