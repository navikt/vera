import mongoose, { Model, Schema } from "mongoose"
import { IEvent } from "../../interfaces/IEvent"

mongoose.Error.messages.general.required = "Property {PATH} is required in JSON request"

const eventSchema = new Schema<IEvent>({
    application: { type: String, lowercase: true, trim: true, required: true },
    environment: { type: String, lowercase: true, trim: true, required: true },
    environmentClass: String,
    version: { type: String, trim: true },
    deployer: { type: String, trim: true, required: true },
    deployed_timestamp: Date,
    replaced_timestamp: Date,
})

eventSchema.set("toJSON", {
    getters: true,
    transform: function (doc, ret) {
        delete ret.__v
        delete ret._id
    },
})

/* eventSchema.statics.getLatestDeployedApplicationsFor = function (predicate: Record<string, any>[]) {
  console.log('getLatestDeployedApplicationsFor');
  return this.find({ replaced_timestamp: null, version: { $ne: null } }).or(predicate);
}; */

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema)

export default Event
