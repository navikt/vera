//import { getLatestDeployedApplicationsFor } from '../models/Event';
import connectDB from '../db';
import Event from '../models/Event';
import compareVersions from '../modules/version-compare';
import _ from 'lodash';
import { IEvent } from '@/interfaces/IEvent';

interface IDiffService {
  environment: string;
  isBaseEnvironment: boolean;
  event?: IEvent;
  diffToBase?: 0 | 1 | -1 | null;
  baseVersion?: string;
}

//export async function diffEnvironments (req, res) {
export async function diffEnvironments(base: string, comparewith: string) {
  await connectDB();

  console.log(base);
  console.log(comparewith);
  //var requestParams = req.query;
  const baseEnv: string = base;
  const environments = comparewith.split(',').concat(baseEnv);
  //let predicate: = {}
  //const predicate: IEnvironment[] = environments.map(env => ({environment: env}))
  //console.log(predicate)
  //replaced_timestamp: null, version: {$ne: null},
  //{environment: {$in: [base, comparewith]}}
  const events = await Event.find({
    replaced_timestamp: { $ne: null },
    version: { $ne: null },
    environment: { $in: [base, comparewith] }
  });
  //console.log(events)
  const baseEvents: IEvent[] = getEventsForEnvironment(events, baseEnv);
  //console.log("baseEvents")
  //console.log(baseEvents)
  const comparedEvents = baseEvents.map((baseEvent) => ({
    application: baseEvent.application,
    environments: compareToBase(baseEvent, events, environments)
  }));

  //console.log(JSON.stringify(comparedEvents))
  return comparedEvents;
}

/* 
eventSchema.statics.getLatestDeployedApplicationsFor = function(predicate) {
    console.log("getLatestDeployedApplicationsFor");
    return this.find({replaced_timestamp: null, version: {$ne: null}}).or(predicate).exec();
}

    Event.getLatestDeployedApplicationsFor(environments.map(env => ({environment: env})), function (err, events) {
        const baseEvents = getEventsForEnvironment(events, baseEnv);
        const comparedEvents = baseEvents.map(baseEvent =>
            ({
                application: baseEvent.application,
                environments: compareToBase(baseEvent, events, environments)
            })
        );

        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(comparedEvents);
    }
); */

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
  console.log('getEventsForEnvironment');
  return events.filter((e) => e.environment.toLowerCase() === env.toLowerCase());
}
