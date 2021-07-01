var _ = require('lodash');

module.exports = {
    buildVersionMatrix: function (versionData, inverseTable) {
        if (inverseTable) {
            return buildVersionMatrixWithEnvsAsRows(versionData)
        }
        return buildVersionMatrixWithAppsAsRows(versionData)
    }
}


function buildVersionMatrixWithAppsAsRows(versionData) {
    var tableHeader = getTableHeader(versionData, 'environment');
    var applicationInstancesGroupedByApplication = groupBy('application', versionData);

    return buildVersionMatrix(tableHeader, applicationInstancesGroupedByApplication, 'environment');
}

function buildVersionMatrixWithEnvsAsRows(versionData) {
    var tableHeader = getTableHeader(versionData, 'application');
    var applicationInstancesGroupedByEnvironment = groupBy('environment', versionData);
    return buildVersionMatrix(tableHeader, applicationInstancesGroupedByEnvironment, 'application');
}

function buildVersionMatrix(tableHeader, applicationInstances, columnKey) {

    var rowKeys = _.sortBy(Object.keys(applicationInstances), function (elem) {
        return elem.toLowerCase();
    });

    var tableContents = [];
    _.forEach(rowKeys, function (element) {
        tableContents.push(generateRow(tableHeader, element, applicationInstances[element], columnKey))
    });

    return {header: tableHeader, body: tableContents}
}

function groupBy(key, versionData) {
    return _.groupBy(versionData, function (element) {
        return element[key]
    });
}

function getTableHeader(versionData, key) {
    var toHeaderObject = function(element) {
        var queryParams = {}
        queryParams[key] = element;
        return {'columnTitle': element, 'queryParams': queryParams}
    };

    var headerData = _.chain(versionData).pluck(key).uniq(function (element) {
        return element.toLowerCase();
    }).sortBy(String).map(toHeaderObject).value();

    return [{'columnTitle': ''}].concat(headerData);
}

function generateRow(columns, firstColumnTitle, applicationInstances, elementKey) {

    var rowData = Array.apply(null, Array(columns.length - 1))
    rowData.unshift(firstColumnTitle)

    for (var i = 1; i < columns.length; i++) {
        var filtered = _.filter(applicationInstances, function (appInstance) {
            return appInstance[elementKey] === columns[i].columnTitle
        });

        if (filtered.length === 1) {
            rowData[i] = _.head(filtered);
        }
    }
    return rowData;
}
