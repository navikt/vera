var _ = require('lodash');
var http = require('http');
require('natural-compare-lite')
fs = require('fs')

//http.get("http://b27isvl001.preprod.local:9080/version", function(res) {

    var rawdata = [
        {
            "application": "Aareg",
            "environment": "T1",
            "version": "1.2.3",
            "deployer": "Mats"
        },
        {
            "application": "Aareg",
            "environment": "P",
            "version": "10 000 000",
            "deployer": "Mats"
        },
        {
            "application": "Aareg",
            "environment": "Q1",
            "version": "12.3",
            "deployer": "Per"
        },
        {
            "application": "Aareg",
            "environment": "Q3",
            "version": "23.1",
            "deployer": "Espen"
        },
        {
            "application": "Aareg",
            "environment": "Q2",
            "version": "3.2.1",
            "deployer": "Max Mekker"
        },
        {
            "application": "Bbreg",
            "environment": "P",
            "version": "1.2.3",
            "deployer": "Mats"
        },
        {
            "application": "Bbreg",
            "environment": "Q1",
            "version": "12.3",
            "deployer": "Per"
        },
        {
            "application": "Bbreg",
            "environment": "Q3",
            "version": "23.1",
            "deployer": "Espen"
        },
        {
            "application": "Bbreg",
            "environment": "T3",
            "version": "3.2.1",
            "deployer": "Max Mekker"
        },
        {
            "application": "Ccreg",
            "environment": "T1",
            "version": "4",
            "deployer": "Kjetnt"
        },
        {
            "application": "Ccreg",
            "environment": "T4",
            "version": "1234",
            "deployer": "Per Kjell"
        },
        {
            "application": "Ccreg",
            "environment": "Q1",
            "version": "23.1",
            "deployer": "Espen"
        },
        {
            "application": "Ccreg",
            "environment": "Q2",
            "version": "3.2.1",
            "deployer": "Max Mekker"
        },
        {
            "application": "Ccreg",
            "environment": "Q4",
            "version": "1.2.3-alpha03-beta2-stable-SNAPHOT",
            "deployer": "Bjarne Betjent"
        },
        {
            "application": "Ddreg",
            "environment": "T1",
            "version": "1234",
            "deployer": "Skurven"
        },
        {
            "application": "Ddreg",
            "environment": "T2",
            "version": "3.2.1",
            "deployer": "Max Mekker"
        },
        {
            "application": "Ddreg",
            "environment": "T3",
            "version": "3.3.3",
            "deployer": "Max Mekker"
        },
        {
            "application": "Ddreg",
            "environment": "T4",
            "version": "666",
            "deployer": "Max Mekker"
        },
        {
            "application": "Ddreg",
            "environment": "Q1",
            "version": "33.2.2.2.",
            "deployer": "Max Mekker"
        },
        {
            "application": "Ddreg",
            "environment": "Q2",
            "version": "22.3.3.33",
            "deployer": "Max Mekker"
        },
        {
            "application": "Ddreg",
            "environment": "Q3",
            "version": "13.5.63.23",
            "deployer": "Max Mekker"
        },
        {
            "application": "Ddreg",
            "environment": "Q4",
            "version": "1.34.2",
            "deployer": "Max Mekker"
        },
        {
            "application": "Ddreg",
            "environment": "P",
            "version": "12.4",
            "deployer": "Max Mekker"
        },
        {
            "application": "Eereg",
            "environment": "T4",
            "version": "1000",
            "deployer": "Max Mekker"
        },
        {
            "application": "Eereg",
            "environment": "Q1",
            "version": "2000",
            "deployer": "Max Mekker"
        },
        {
            "application": "Eereg",
            "environment": "P",
            "version": "3000",
            "deployer": "Max Mekker"
        },
        {
            "application": "Eereg",
            "environment": "T3",
            "version": "500",
            "deployer": "Max Mekker"
        },
        {
            "application": "Eereg",
            "environment": "Q2",
            "version": "250",
            "deployer": "Max Mekker"
        },
        {
            "application": "Eereg",
            "environment": "Q4",
            "version": "125",
            "deployer": "Max Mekker"
        }
    ]

    function doingStuff(versionJson) {

        environments = getDistinctEnvironments(versionJson);

        var applicationInstancesGroupedByApplication = _.chain(versionJson).groupBy(function(element) {
            return element['application']

        }).value();

        var applications = Object.keys(applicationInstancesGroupedByApplication);
        var tableContents = [];
        _.forEach(applications, function(element) {
            tableContents.push(generateApplicationRow(environments, element, applicationInstancesGroupedByApplication[element]))
        });

        generateHtml(environments, tableContents);

    }



function getDistinctEnvironments(versionData) {
    var environments = _.chain(versionData).pluck('environment').uniq(function(element) {
        return element.toLowerCase();
    }).sortBy(String).value();
    environments.unshift('Application');

    return environments;
}

function generateApplicationRow(columns, appName, applicationInstances) {
    var rowData = Array.apply(null, Array(columns.length -1))
    rowData.unshift(appName)

    for(var i = 1; i < columns.length; i++) {
        var filtered = _.filter(applicationInstances, function(appInstance) {
            return appInstance.environment === columns[i]
        });

        if(filtered.length === 1 ) {
            rowData[i] = _.first(filtered);
        }
    }
    return rowData;
}

doingStuff(rawdata);

function generateHtml(environments, tableContents) {
    var html = "<html><body>";
    html += "<table border='1'>";
    html += "<thead><tr><th>" + environments.join("</th><th>") + "</th><tr></thead>";

    _.forEach(tableContents, function(row) {
        var rowArray = [row[0]]
        for(var i = 1; i < row.length; i++ ) {
            if(row[i]) {
                rowArray.push(row[i].version)
            }
            else {
                rowArray.push("na")
            }

        }
        html += "<tr><td>" + rowArray.join("</td><td>") + "</td></tr>";
    });

    html += "</body></html>";

    console.log(html)
    fs.writeFile("vera.html", html)
}
