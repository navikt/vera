var path = require('path'),
rootPath = path.normalize(__dirname + '/..');

var config = {
    root: rootPath,
    port: process.env['PORT'] || 8080,
    dbUrl: process.env['VERADB_URL'] || "mongodb://127.0.0.1/deploy_log",
    dbUser: process.env['VERADB_USERNAME'] || "vera",
    dbPassword: process.env['VERADB_PASSWORD'] || "<hemmelig>",
}

module.exports = config