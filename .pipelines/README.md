# Secure DMS CI/CD Pipelines

## Continuous Integration

GitHub Actions workflow:

`.github/workflows/ci.yml`

The CI pipeline performs:

- Backend dependency installation
- Backend tests
- Frontend dependency installation
- Frontend production build

## Continuous Deployment

### Backend

Workflow:

`.github/workflows/cd-backend.yml`

Deploys the backend application to:

`dms-backend-appservice-hari`

### Frontend

Workflow:

`.github/workflows/cd-frontend.yml`

Builds the React frontend and deploys the `dist` output to:

`dmsfrontendhari2026` `$web`

## Deployment Authentication

GitHub Actions uses Microsoft Entra ID workload identity federation (OIDC) to authenticate with Azure.

No long-lived Azure client secret is stored in GitHub Actions.

## Deployment Flow

Git Push
   |
   v
Secure DMS CI
   |
   +---- Backend CI
   |
   +---- Frontend CI
   |
   v
Backend CD + Frontend CD
   |
   v
Azure
