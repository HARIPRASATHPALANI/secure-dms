# Secure DMS Architecture

## Overview

Secure Digital Document Management Portal deployed on Microsoft Azure.

## Architecture Flow

User Browser
    |
    v
Microsoft Entra ID
    |
    v
Application Gateway + WAF
    |
    +----------------------+
    |                      |
    v                      v
Azure Storage         Azure App Service
Static Website        Secure DMS Backend
                           |
                           v
                    Azure Cosmos DB
                    Private Endpoint

Backend document storage:

Azure App Service
        |
        v
Azure Blob Storage

Monitoring:

App Service / Cosmos DB
        |
        v
Application Insights
        |
        v
Log Analytics
        |
        v
Azure Monitor Alerts
        |
        v
Action Group Email

## Network

VNet: dms-vnet (10.0.0.0/16)

- dms-app-subnet: 10.0.1.0/24
- dms-data-subnet: 10.0.2.0/24
- GatewaySubnet: 10.0.3.0/24
- dms-applicationgate-subnet: 10.0.4.0/24

## Security

- Microsoft Entra ID authentication
- Application Gateway WAF
- HTTPS/TLS
- App Service access restrictions
- VNet integration
- Cosmos DB public network access disabled
- Cosmos DB Private Endpoint
- Managed Identity
- Azure Blob Storage public access disabled
- Application Insights and Azure Monitor alerts

## CI/CD

GitHub Actions is used for CI/CD.

- Backend CI
- Frontend CI
- Backend CD to Azure App Service
- Frontend CD to Azure Storage

## Infrastructure as Code

Bicep modules are maintained under `infra/`.

The current Bicep implementation references the existing Azure infrastructure using `existing` resources to avoid modifying the running production environment.
