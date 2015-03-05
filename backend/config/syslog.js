var SysLogger = require('ain2');

var logger = (process.env.NODE_ENV !== 'development') ? new SysLogger({tag: "vera", hostname: "dockerhost"}) : console;

module.exports = logger;