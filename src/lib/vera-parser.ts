import { IFilteredJsonData } from '@/interfaces/IFilteredJsonData';
import _ from 'lodash';

export default function buildVersionMatrix(versionData, inverseTable): IFilteredJsonData {
  if (inverseTable) {
    return buildVersionMatrixWithEnvsAsRows(versionData);
  }
  return buildVersionMatrixWithAppsAsRows(versionData);
}

function buildVersionMatrixWithAppsAsRows(versionData): IFilteredJsonData {
  const tableHeader = getTableHeader(versionData, 'environment');
  const applicationInstancesGroupedByApplication = groupBy('application', versionData);

  return buildVersionMatrixTable(tableHeader, applicationInstancesGroupedByApplication, 'environment');
}

function buildVersionMatrixWithEnvsAsRows(versionData): IFilteredJsonData {
  const tableHeader = getTableHeader(versionData, 'application');
  const applicationInstancesGroupedByEnvironment = groupBy('environment', versionData);
  return buildVersionMatrixTable(tableHeader, applicationInstancesGroupedByEnvironment, 'application');
}

function buildVersionMatrixTable(tableHeader, applicationInstances, columnKey): IFilteredJsonData {
  const rowKeys = _.sortBy(Object.keys(applicationInstances), function (elem) {
    return elem.toLowerCase();
  });

  const tableContents = [];
  _.forEach(rowKeys, function (element) {
    tableContents.push(generateRow(tableHeader, element, applicationInstances[element], columnKey));
  });

  return { header: tableHeader, body: tableContents };
}

function groupBy(key, versionData) {
  return _.groupBy(versionData, function (element) {
    return element[key];
  });
}

function getTableHeader(versionData, key) {
  const toHeaderObject = (element) => {
    const queryParams = {};
    queryParams[key] = element;
    return { columnTitle: element, queryParams: queryParams };
  };

  const headerData = _.chain(versionData)
    .map(key)
    .uniq((element) => {
      return element.toLowerCase();
    })
    .sortBy(String)
    .map(toHeaderObject)
    .value();

  return [{ columnTitle: '' }].concat(headerData);
}

function generateRow(columns, firstColumnTitle, applicationInstances, elementKey) {
  const rowData = Array.apply(null, Array(columns.length - 1));
  rowData.unshift(firstColumnTitle);

  for (let i = 1; i < columns.length; i++) {
    const filtered = _.filter(applicationInstances, function (appInstance) {
      return appInstance[elementKey] === columns[i].columnTitle;
    });

    if (filtered.length === 1) {
      rowData[i] = _.head(filtered);
    }
  }
  return rowData;
}
