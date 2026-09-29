param appServiceName string
param cosmosAccountName string
param location string = resourceGroup().location

var workspaceName = 'dms-log-analytics'
var appInsightsName = 'dms-backend-appservice-hari'
var actionGroupName = 'dms-alerts'

resource workspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: workspaceName
  location: location
  properties: {
    retentionInDays: 30
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: workspace.id
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    RetentionInDays: 90
  }
}

resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: actionGroupName
  location: 'global'
  properties: {
    groupShortName: 'dmsalerts'
    enabled: true
    emailReceivers: [
      {
        name: 'dmsadmin'
        emailAddress: 'haripalani333@gmail.com'
        useCommonAlertSchema: false
      }
    ]
  }
}

resource appService 'Microsoft.Web/sites@2024-04-01' existing = {
  name: appServiceName
}

resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' existing = {
  name: cosmosAccountName
}

resource appService5xxAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'dms-appservice-5xx-alert'
  location: 'global'
  properties: {
    description: 'Alert when Secure DMS backend returns HTTP 5xx errors'
    severity: 2
    enabled: true
    scopes: [
      appService.id
    ]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          criterionType: 'StaticThresholdCriterion'
          name: 'cond0'
          metricName: 'Http5xx'
          operator: 'GreaterThan'
          threshold: 5
          timeAggregation: 'Total'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

resource cosmosRuAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'dms-cosmos-ru-alert'
  location: 'global'
  properties: {
    description: 'Alert when Secure DMS Cosmos DB request units increase'
    severity: 2
    enabled: true
    scopes: [
      cosmos.id
    ]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          criterionType: 'StaticThresholdCriterion'
          name: 'cond0'
          metricName: 'TotalRequestUnits'
          operator: 'GreaterThan'
          threshold: 1000
          timeAggregation: 'Total'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}

output workspaceId string = workspace.id
output appInsightsId string = appInsights.id
output actionGroupId string = actionGroup.id
