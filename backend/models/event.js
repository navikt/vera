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
    //TODO sett alle andre til false
    return new Event({
        application: obj.application,
        environment: obj.environment,
        version: obj.version,
        deployer: obj.deployedBy,
        timestamp: new Date(),
        latest: true
    });
}

module.exports = Event = mongoose.model('Event', eventSchema);
