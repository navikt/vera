var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

var config = {
    root: rootPath,
    port: process.env.PORT || 1337,
    dbUrl: process.env['db.url'] || "heltfeilhost",
    dbUser: process.env['db.username'] || "hvemsomhelst",
    dbPassword: process.env['db.password'] || "<hemmelig>",
    dbSchema: process.env['db.schema'] || "R4321-B-ALTINN"
}

module.exports = config