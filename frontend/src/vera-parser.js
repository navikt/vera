var _ = require('lodash');

module.exports = {
    buildVersionMatrix: function (versionData) {
        var tableHeader = getDistinctEnvironments(versionData);

        var applicationInstancesGroupedByApplication = groupByApplication(versionData);
        console.log("adfas ", applicationInstancesGroupedByApplication)

        var applications = _.sortBy(Object.keys(applicationInstancesGroupedByApplication), function (app) {
            return app.toLowerCase();
        });

        var tableContents = [];
        _.forEach(applications, function (element) {
            tableContents.push(generateApplicationRow(tableHeader, element, applicationInstancesGroupedByApplication[element]))
        });

        return {header: tableHeader, body: tableContents};
    },

    countRows: function(versionData) {
        return Object.keys(groupByApplication(versionData)).length;
    }
}

function groupByApplication(versionData) {
    console.log("asdfasf")
    return _.groupBy(versionData, function (element) {
        return element['application']
    });
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