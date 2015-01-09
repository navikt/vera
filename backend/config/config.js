var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

var config = {
    root: rootPath,
    port: process.env.PORT || 9080,
    dbUrl: process.env['db_url'] || "mongodb://localhost/deploy_log",
    dbUser: process.env['db_username'] || "hvemsomhelst",
    dbPassword: process.env['db_password'] || "<hemmelig>"
}

module.exports = config