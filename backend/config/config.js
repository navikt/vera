var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

var config = {
    root: rootPath,
    port: process.env.PORT || 9080,
    dbUrl: process.env['veraDb_url'] || "mongodb://localhost/deploy_log",
    dbUser: process.env['veraDb_username'] || "hvemsomhelst",
    dbPassword: process.env['veraDb_password'] || "<hemmelig>"
}

module.exports = config