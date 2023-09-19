export interface IEvent {
  application: string;
  environment: string;
  environmentClass?: string;
  version?: string;
  deployer: string;
  deployed_timestamp?: Date;
  replaced_timestamp?: Date;
}

export interface IEnvironment {
  environment: string;
}
