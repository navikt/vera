import { Moment } from 'moment';
import { IEvent } from './IEvent';

export interface IEventEnriched extends IEvent {
  momentTimestamp?: Moment;
  newDeployment?: boolean;
}

export interface IFilteredJsonDataBody {
  [index: number]: string | undefined | IEventEnriched;
}

export interface IHeader {
  columnTitle: string;
  queryParams: {
    environment?: string;
    application?: string;
  };
}

export interface IFilteredJsonData {
  body: IFilteredJsonDataBody[];
  header: IHeader[];
}

export interface IEventResponse {
  application: string,
  environment: string,
  version: string,
  deployer: string,
  deployed_timestamp: string
}
