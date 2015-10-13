var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

var config = {
    root: rootPath,
    port: process.env['PORT'] || 8443,
    dbUrl: process.env['veraDb_url'] || "mongodb://localhost/deploy_log",
    dbUser: process.env['veraDb_username'] || "vera",
    dbPassword: process.env['veraDb_password'] || "<hemmelig>",
    tlsPrivateKey: process.env['TLS_PRIVATE_KEY'] || "private.key",
    tlsCert: process.env['TLS_CERT'] || "cacert.pem",
    plasterUrl: process.env['plaster_url'] || ""
}

module.exports = config