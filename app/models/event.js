var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
    application: String,
    environment: String,
    version: String,
    deployer: String,
    timestamp: Date
});

eventSchema.statics.createFromObject = function(obj) {
    return new Event({
        application: obj.application,
        environment: obj.environment,
        version: obj.version,
        deployer: obj.deployedBy,
        timestamp: new Date()
    });
}

module.exports = Event = mongoose.model('Event', eventSchema);
