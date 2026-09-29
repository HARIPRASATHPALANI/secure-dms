param appServiceName string
param vnetName string
param location string = resourceGroup().location

var appServicePlanName = 'ASP-dmscapstonerg-adbd'

resource appServicePlan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: appServicePlanName
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
    size: 'B1'
    family: 'B'
    capacity: 1
  }
  properties: {
    reserved: true
    perSiteScaling: false
    maximumElasticWorkerCount: 1
    zoneRedundant: false
  }
}

resource appService 'Microsoft.Web/sites@2024-04-01' = {
  name: appServiceName
  location: location
  kind: 'app,linux'

  identity: {
    type: 'SystemAssigned'
  }

  properties: {
    httpsOnly: true
    serverFarmId: appServicePlan.id

    siteConfig: {
      appSettings: [
        {
          name: 'ENTRA_TENANT_ID'
          value: '8c37f683-4650-4f96-a8f6-913074d31bdf'
        }
        {
          name: 'ENTRA_BACKEND_CLIENT_ID'
          value: '43af1ad1-05d2-40c3-b9ed-058af584f1ec'
        }
        {
          name: 'ENTRA_API_AUDIENCE'
          value: 'api://43af1ad1-05d2-40c3-b9ed-058af584f1ec'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
      ]
      linuxFxVersion: 'NODE|22-lts'
      appCommandLine: 'node src/app.js'
      ftpsState: 'FtpsOnly'
      minTlsVersion: '1.2'
      alwaysOn: false
      use32BitWorkerProcess: true

      ipSecurityRestrictions: [
        {
          name: 'Allow-ApplicationGateway'
          priority: 100
          action: 'Allow'
          vnetSubnetResourceId: resourceId(
            'Microsoft.Network/virtualNetworks/subnets',
            vnetName,
            'dms-applicationgate-subnet'
          )
        }
        {
          name: 'Deny all'
          priority: 2147483647
          action: 'Deny'
          ipAddress: 'Any'
        }
      ]
    }

    virtualNetworkSubnetId: resourceId(
      'Microsoft.Network/virtualNetworks/subnets',
      vnetName,
      'dms-app-subnet'
    )

    vnetRouteAllEnabled: true
    publicNetworkAccess: 'Enabled'
  }
}

resource blobStorage 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: 'dmsdocuments2026hari'
}

resource blobDataContributorRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(
    blobStorage.id,
    appService.id,
    'Storage Blob Data Contributor'
  )
  scope: blobStorage
  properties: {
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
    )
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

output appServiceId string = appService.id
output appServiceName string = appService.name
output appServicePlanId string = appServicePlan.id
output appServicePrincipalId string = appService.identity.principalId
