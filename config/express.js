var express = require('express'),
    bodyParser = require('body-parser'),
    dexter = require('morgan');

module.exports = function(app, config) {
    app.use(bodyParser());
    app.use(dexter());

    app.set('port', config.port);
    app.use(function(req, res, next) {
        console.log("Logging function got %s %s ", req.method, req.url);
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'POST');
    });

    var logError = function(err, req, res, next){
        console.log("Error: %s", err.message);
        return next(err);
    }

    var errorHandler = function(err, req, res, next) {
        res.send(500, {
            status: 500,
            message: "internal error",
            error: err.message
        });
    };

    app.use(logError);
    app.use(errorHandler);


}