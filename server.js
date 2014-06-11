var express = require('express'),
    app = express(),
    config = require('./config/config');

require('./config/routes')(app);
require('./config/express')(app, config);

app.listen(config.port, function () {
    console.log("Ready for e-business");
});