export interface IFilter {
    application: string[];
    environment: string[];
    environmentClass: string[];
    deployer?: string;
    version?: string;
    time?: string;
}
