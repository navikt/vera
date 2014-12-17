var http = require('http');
fs = require('fs');
var _ = require('lodash');
var veraparser = require('./vera-parser.js');

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

getFromRealVera();

function getFromRealVera() {
    http.get("http://localhost:9080/version", function(response) {
        var jsonResponse = '';
        response.on('data', function(data) {
            jsonResponse += data;
        });

        response.on('end', function() {
            //veraparser.filterEnv(JSON.parse(jsonResponse), ['t1', 'p', 'q'], veraparser.builVersionMatrix)
            veraparser.builVersionMatrix(JSON.parse(jsonResponse), generateVersionMatrix);
            //veraparser.builVersionTimeLine(JSON.parse(jsonResponse), generateHtml);
        });
    });
}

function generateHtml(tableHeader, tableRows) {
    var html = "<html><body><table border='1'>";
    html += "<thead><tr><th>" + tableHeader.join("</th><th>") + "</th><tr></thead>";

    _.forEach(tableRows, function(row) {
        html += "<tr><td>" + row.join("</td><td>") + "</td></tr>";
    });

    html += "</body></html>";

    console.log(html)
    console.log("Wrote vera.html")
    fs.writeFile("vera.html", html)
}


function generateVersionMatrix(tableHeader, tableContents) {
    var tableRows = [];
    _.forEach(tableContents, function(row) {
        var rowArray = [row[0]]
        for(var i = 1; i < row.length; i++ ) {
            if(row[i]) {
                rowArray.push(row[i].version)
            }
            else {
                rowArray.push("")
            }
        }
        tableRows.push(rowArray);
    })
    generateHtml(tableHeader, tableRows);
}
