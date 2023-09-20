import { IEvent } from "./IEvent";


export interface IDiffEvent {
    application: string;
    environments: environment[];
}

 interface environment {
    environment: string;
    version?: string;
     comparedToBase?: number;
}
  
  