var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

var config = {
    root: rootPath,
    port: process.env.PORT || 1337,
    dbUrl: process.env['db_url'] || "heltfeilhost",
    dbUser: process.env['db_username'] || "hvemsomhelst",
    dbPassword: process.env['db_password'] || "<hemmelig>",
    dbSchema: process.env['db_schema'] || "R4321-B-ALTINN"
}

module.exports = config