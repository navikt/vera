import connectDB from "../db"
import Event from "../models/Event"

export async function diffEnvironments(base: string, comparewith: string) {
    await connectDB()

    const baseEnv: string = base
    const environments = comparewith.split(",").concat(baseEnv)
    //  console.log(environments)

    const events = await Event.find({
        replaced_timestamp: { $eq: null },
        version: { $ne: null },
        environment: { $in: environments },
    })

    return events
}

/* 
function compareToBase(baseEvent: IEvent, events: IEvent[], environments: string[]): IDiffService[] {
  return environments.map(function (environment: string) {
    const eventToCompare = getEventFor(events, baseEvent.application, environment);
    const isBaseEnvironment = environment === baseEvent.environment;
    const diffResult: IDiffService = {
      environment: environment,
      isBaseEnvironment: isBaseEnvironment
    };

    if (eventToCompare) {
      diffResult.event = eventToCompare;
      diffResult.diffToBase = compareVersions(eventToCompare.version, baseEvent.version);
    }
    if (!isBaseEnvironment) {
      diffResult.baseVersion = baseEvent.version;
    }
    return diffResult;
  });
}

function getEventFor(events: IEvent[], application: string, environment: string) {
  return _.chain(events)
    .filter((event) => {
      return event.environment.toString() === environment && event.application.toLowerCase() === application;
    })
    .first()
    .value();
}

function getEventsForEnvironment(events: IEvent[], env: string): IEvent[] {
  return events.filter((e) => e.environment.toLowerCase() === env.toLowerCase());
} */
