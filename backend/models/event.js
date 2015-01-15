var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
    application: String,
    environment: String,
    version: String,
    latest: Boolean,
    deployer: String,
    timestamp: Date
});

eventSchema.statics.createFromObject = function(obj) {
    return new Event({
        application: obj.application.toLowerCase().trim(),
        environment: obj.environment.toLowerCase().trim(),
        version: obj.version.trim(),
        deployer: obj.deployedBy.trim(),
        timestamp: new Date(),
        latest: true
    });
}

module.exports = Event = mongoose.model('Event', eventSchema);
