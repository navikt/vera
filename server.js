var express = require('express'),
    bodyParser = require('body-parser'),
    dexter = require('morgan'),
    config = require('./config/config'),
    mongoose = require('mongoose'),
    app = express();

var cors = function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
}

app.use(cors);
app.use(bodyParser());
app.use(dexter());

app.set('port', config.port);
require('./config/routes')(app);

var logError = function(err, req, res, next){
    console.log("Error: %s", err.message);
    return next(err);
}

var errorHandler = function(err, req, res, next) {
    res.send({
        status: res.statusCode,
        message: "internal error",
        error: err.message
    });
};

mongoose.connect(config.dbUrl);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

app.use(logError);
app.use(errorHandler);

app.use(express.static(__dirname + "/public"));

app.listen(config.port, function () {
    console.log("Ready for e-business on port " + config.port );
});
