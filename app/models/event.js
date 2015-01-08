var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
    application: String,
    environment: String,
    version: String,
    deployer: String,
    timestamp: Date
});

module.exports = Event = mongoose.model('Event', eventSchema);
