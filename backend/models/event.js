var mongoose = require('mongoose');
var moment = require('moment');

mongoose.Error.messages.general.required = "Property {PATH} is required in JSON request";

var eventSchema = mongoose.Schema({
    application: {type: String, lowercase: true, trim: true, required: true},
    environment: {type: String, lowercase: true, trim: true, required: true},
    environmentClass: String,
    version: {type: String, trim: true, required: true},
    deployer: {type: String, trim: true, required: true},
    deployed_timestamp: Date,
    replaced_timestamp: Date
});

eventSchema.set('toJSON', {
    getters: true, transform: function (doc, ret, options) {
        delete ret.__v;
        delete ret._id;
    }
});

function getEnvClassFromEnv(environment) {
    var potentialEnvClass =  environment.charAt(0).toLowerCase();
    if(potentialEnvClass === "t" || potentialEnvClass === "q" || potentialEnvClass === "p") {
        return potentialEnvClass;
    }
    return "u";
}

eventSchema.statics.createFromObject = function(obj) {
    return new Event({
        application: obj.application,
        environment: obj.environment,
        version: obj.version,
        deployer: obj.deployedBy,
        deployed_timestamp: new Date(),
        replaced_timestamp: null,
        environmentClass: (obj.environmentClass) ? obj.environmentClass : getEnvClassFromEnv(obj.environment)
    });
}

module.exports = Event = mongoose.model('Event', eventSchema);