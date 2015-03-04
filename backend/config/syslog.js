var SysLogger = require('ain2');

var logger = (process.env.NODE_ENV !== 'development') ? new SysLogger() : console;

module.exports = logger;