var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./backend/config/config');
var mongoose = require('mongoose');
var http = require('http');
var fs = require('fs');
var validation = require('express-validation');
var app = express();
var logger = require('./backend/config/syslog');
const prometheus = require('prom-client')
prometheus.collectDefaultMetrics()

var cors = function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
};

var noCache = function(req,res,next){
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    return next();
};

app.use(cors);
app.use(noCache);
app.use(bodyParser.json());
app.use(morgan('[:date[clf]] :remote-addr :method :status :url content-length: :res[content-length] response-time: :response-time ms'));

app.set('port', config.port);
require('./backend/config/routes')(app);

var logError = function (err, req, res, next) {
    if(!err instanceof  validation.ValidationError) {
        logger.log("Error: %s", err.message);
    }
    return next(err);
}

var errorHandler = function (err, req, res, next) {
    if(err instanceof validation.ValidationError) {
        return res.status(err.status).json(err);
    }
    res.send({
        status: res.statusCode,
        message: err.message || "internal error "
    });
};

mongoose.connect(config.dbUrl, {
    useMongoClient: true,
});
mongoose.Promise = require('bluebird');
logger.log("Using MongoDB URL", config.dbUrl);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.use(logError);
app.use(errorHandler);

app.use(express.static(__dirname + "/frontend/build"));

app.get("/isReady", (req, res) => {
    res.sendStatus(200)
});

app.get("/isAlive", (req, res) => {
    res.sendStatus(200)
});

app.get('/metrics', (req, res) => {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(prometheus.register.metrics());
});

app.listen(config.port, function () {
    logger.log("Running on port " + config.port)
});

module.exports = app;
