var express = require('express'),
    bodyParser = require('body-parser'),
    dexter = require('morgan');

module.exports = function(app, config) {
    app.use(bodyParser());
    app.use(dexter());
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'POST');
        next();
    });
    app.set('port', config.port);
}