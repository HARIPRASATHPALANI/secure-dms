targetScope = 'resourceGroup'

param vnetName string = 'dms-vnet'
param frontendStorageName string = 'dmsfrontendhari2026'
param documentStorageName string = 'dmsdocuments2026hari'
param cosmosAccountName string = 'dms-cosmos-2026-hari'
param appServiceName string = 'dms-backend-appservice-hari'
param appGatewayName string = 'dms-applicationgate'

module networking './modules/networking.bicep' = {
  name: 'dms-networking'
  params: {
    vnetName: vnetName
  }
}

module storage './modules/storage.bicep' = {
  name: 'dms-storage'
  params: {
    frontendStorageName: frontendStorageName
    documentStorageName: documentStorageName
  }
}

module cosmos './modules/cosmos.bicep' = {
  name: 'dms-cosmos'
  params: {
    cosmosAccountName: cosmosAccountName
  }
}

module appservice './modules/appservice.bicep' = {
  name: 'dms-appservice'
  params: {
    appServiceName: appServiceName
  }
}

module appgateway './modules/appgateway.bicep' = {
  name: 'dms-appgateway'
  params: {
    appGatewayName: appGatewayName
  }
}
