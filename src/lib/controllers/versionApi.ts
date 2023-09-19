import config from '../config/config';
import connectDB from '../db';
import Event from '../models/Event';
import jsonToCSV from '@iwsio/json-csv-node';
import _ from 'lodash';
import moment from 'moment';
import { IEvent } from '@/interfaces/IEvent';

/* interface IParameterDefinition {
    application?: RegExp;
    environment?: RegExp;
    deployer?: RegExp;
    version?: RegExp;
    last?: string;
    onlyLatest?: boolean;
    filterUndeployed?: string;
} */
function predicateSearchParam(query) {
  const predicate = {};

  const parameterDefinition = {
    application: { mongoTransformation: caseInsensitiveRegexMatch },
    environment: { mongoTransformation: caseInsensitiveRegexMatch },
    deployer: { mongoTransformation: caseInsensitiveRegexMatch },
    environmentClass: { mongoTransformation: caseInsensitiveRegexMatch },
    version: { mongoTransformation: caseInsensitiveRegexMatch },
    last: {
      mongoTransformation: fromMomentFormatToActualDate,
      mapToKey: 'deployed_timestamp'
    },
    onlyLatest: {
      mongoTransformation: emptyOrAll,
      mapToKey: 'replaced_timestamp'
    },
    filterUndeployed: {
      mongoTransformation: function (val: boolean) {
        return val ? { $ne: null } : { $exists: true };
      },
      mapToKey: 'version'
    },
    csv: {}
  };

  _.forOwn(query, function (value, key) {
    //console.log("key: " + key + " value: " + value)
    if (_.has(parameterDefinition, key)) {
      const keyToUse = parameterDefinition[key].mapToKey ? parameterDefinition[key].mapToKey : key;
      const transformFunction = parameterDefinition[key].mongoTransformation;
      try {
        if (transformFunction) {
          predicate[keyToUse] = transformFunction(value);
        }
      } catch (exception) {
        return new Error(exception);
      }
    } else {
      return new Error(
        `Unknown parameter provided: ${key}. Valid parameters are:  ${_.keys(parameterDefinition).join(', ')}`
      );
    }
  });
  console.log('predicate');
  console.log(predicate);
  return predicate;
}

export async function deployLog(query) {
  //const start = Date.now();
  //console.log(query)
  const predicate = predicateSearchParam(query);
  console.log(predicate);
  await connectDB();

  const result: IEvent[] = await Event.find(predicate).sort([['deployed_timestamp', 'descending']]);

  //const aftermongo = Date.now();
  //const mongotime = aftermongo - start
  //const data = events;
  //const done = Date.now();
  //const afterjson = done - aftermongo
  console.log(result);
  return result;
}

export async function returnCSVPayload(events: IEvent[]) {
  const toExcelDateFormat = function (value: Date) {
    if (value) {
      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    }
  };
  const jsonToCsvMapping = {
    fields: [
      { name: 'environment', label: 'environment' },
      { name: 'application', label: 'application' },
      { name: 'version', label: 'version' },
      { name: 'deployer', label: 'deployer' },
      {
        name: 'deployed_timestamp',
        label: 'deployed_timestamp',
        filter: toExcelDateFormat
      },
      {
        name: 'replaced_timestamp',
        label: 'replaced_timestamp',
        filter: toExcelDateFormat
      },
      { name: 'environmentClass', label: 'environmentClass' },
      { name: 'id', label: 'id' }
    ]
  };

  return await jsonToCSV.buffered(events, jsonToCsvMapping);
}

function caseInsensitiveRegexMatch(val: string): RegExp {
  return new RegExp('^' + val + '$', 'i');
}

function fromMomentFormatToActualDate(momentValue): { $gte: string } | Error {
  const timespanPattern = /(^[0-9]+)([a-zA-Z]+$)/;
  if (timespanPattern.test(momentValue)) {
    const matches = momentValue.match(timespanPattern);
    const quantity = matches[1];
    const timeUnit = matches[2];
    return { $gte: moment().subtract(quantity, timeUnit).format() };
  } else {
    throw new Error(
      "Invalid format for parameter 'last'. Format should be <number><period>, e.g. '7days'. See http://momentjs.com/docs/#/manipulating for more info"
    );
  }
}

function emptyOrAll(boolean: boolean): { $exists: boolean } | null {
  if (!boolean) {
    return { $exists: true }; // matches all values as long as the key is present (null-value as well)
  } else {
    return null;
  }
}

export function getConfig() {
  /* var environmentCfg = {
            dbUrl: config.dbUrl,
            dbUser: config.dbUser
        }
        res.json(environmentCfg); */
  return {
    dbUrl: config.dbUrl,
    dbUser: config.dbUser
  };
}

function getEnvClassFromEnv(environment: string) {
  const potentialEnvClass = environment.charAt(0).toLowerCase();
  if (potentialEnvClass === 't' || potentialEnvClass === 'q' || potentialEnvClass === 'p') {
    return potentialEnvClass;
  }
  return 'u';
}

function createEventFromObject(obj) {
  return new Event({
    application: obj.application,
    environment: obj.environment,
    version: obj.version || null,
    deployer: obj.deployedBy,
    deployed_timestamp: new Date(),
    replaced_timestamp: null,
    environmentClass: obj.environmentClass ? obj.environmentClass : getEnvClassFromEnv(obj.environment)
  });
}
export async function registerEvent(data: IEvent) {
  /**
   * Creates a new event object, and stores it in mongo if there are no validation errors
   * If a new event document is successfully created, the existing documents for this application and environment are
   * updated so that latest is set to false
   * */

  await connectDB();

  const newEvent = new Event(createEventFromObject(data));

  // Updating existing events
  const existingEvent = await Event.find({
    environment: new RegExp('^' + newEvent.environment + '$', 'i'),
    application: new RegExp('^' + newEvent.application + '$', 'i'),
    replaced_timestamp: null
  }).exec();
  await existingEvent.map(async (e) => {
    console.log('existing event replacing' + e);
    e.replaced_timestamp = new Date();
    return e.save();
  });

  // Save new event
  const savedEvent = await newEvent.save();

  console.log(savedEvent);
  console.log(existingEvent);
  console.log('existingEvent');
  console.log(existingEvent);

  //await Promise.all(updatePromise);
  return savedEvent;
}
