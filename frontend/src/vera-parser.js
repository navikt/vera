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
    },

    builVersionTimeLine: function (versionData, callback) {
        //var tableHeader = ['Application', 'Version', 'Environment', 'Deployed by', 'Last deployment'];
        var tableHeader = ['Application', 'Version', 'Environment', 'Deployed by'];
        var tableContents = [];

        _.chain(versionData).sortBy(function (element) {
            return element.application.toLowerCase();
        }).forEach(function(rowdata){
            tableContents.push([rowdata.application, rowdata.version, rowdata.environment, rowdata.deployer]);
        });

        callback(tableHeader, tableContents);

    },

    filterEnv: function (versionData, filters, callback) {
        _.forEach(filters, function (filter) {
            console.log("\n\n******")
            console.log(filter)
            _.filter(versionData, function (appInstance) {
                console.log(appInstance.environment)
                return appInstance.environment.indexOf(filter) >= 0;
            })
        })
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