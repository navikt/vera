var _ = require('lodash');

module.exports = {
    buildVersionMatrix: function (versionData, callback) {
        var tableHeader = getDistinctEnvironments(versionData);

        var applicationInstancesGroupedByApplication = _.chain(versionData).groupBy(function (element) {
            return element['application']
        }).value();

        var applications = _.sortBy(Object.keys(applicationInstancesGroupedByApplication), function (app) {
            return app.toLowerCase();
        });

        var tableContents = [];
        _.forEach(applications, function (element) {
            tableContents.push(generateApplicationRow(tableHeader, element, applicationInstancesGroupedByApplication[element]))
        });

        callback(tableHeader, tableContents);
    }
}


function getDistinctEnvironments(versionData) {
    var environments = _.chain(versionData).pluck('environment').uniq(function (element) {
        return element.toLowerCase();
    }).sortBy(String).value();
    environments.unshift('Application');

    return environments;
}

function generateApplicationRow(columns, appName, applicationInstances) {
    var rowData = Array.apply(null, Array(columns.length - 1))
    rowData.unshift(appName)

    for (var i = 1; i < columns.length; i++) {
        var filtered = _.filter(applicationInstances, function (appInstance) {
            return appInstance.environment === columns[i]
        });

        if (filtered.length === 1) {
            rowData[i] = _.first(filtered);
        }
    }
    return rowData;
}