var mongoose = require('mongoose');
var moment = require('moment');

mongoose.Error.messages.general.required = "Property {PATH} is required in JSON request";

var eventSchema = mongoose.Schema({
    application: {type: String, lowercase: true, trim: true, required: true},
    environment: {type: String, lowercase: true, trim: true, required: true},
    version: {type: String, trim: true, required: true},
    deployer: {type: String, trim: true, required: true},
    deployed_timestamp: Date,
    replaced_timestamp: Date
});



eventSchema.set('toJSON', {getters: true, transform: function(doc, ret, options) {
    delete ret.__v;
    delete ret._id;
    ret.deployed_timestamp = moment(ret.deployed_timestamp).format('DD-MM-YY HH:mm:ss');
    if (ret.replaced_timestamp){
        ret.replaced_timestamp = moment(ret.replaced_timestamp).format('DD-MM-YY HH:mm:ss');
    } else {
        ret.replaced_timestamp = ""
    }

}});

eventSchema.statics.createFromObject = function(obj) {
    return new Event({
        application: obj.application,
        environment: obj.environment,
        version: obj.version,
        deployer: obj.deployedBy,
        deployed_timestamp: new Date(),
        replaced_timestamp: null
    });
}

module.exports = Event = mongoose.model('Event', eventSchema);