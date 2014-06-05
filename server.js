var express = require('express'),
    app = express(),
    config = require('./config/config');


app.use(function(req, res, next) {
    console.log("Logging function got %s %s ", req.method, req.url);
    next();
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send(500, "Ohh noes, something terrible has just happened");
});

require('./config/express')(app, config);
require('./config/routes')(app);

app.listen(config.port, function () {
    console.log("Ready for e-business");
});