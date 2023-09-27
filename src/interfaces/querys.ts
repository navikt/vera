export interface IQueryParameter {
    //[key: string]: RegExp | { $exists: boolean; } | { $gte: string; } | { $ne: null; } | null;
    [key: string]: string
}

export interface IPredicateMongoDefinition {
    [key: string]: {
        mongoTransformation: (val: string) => RegExp | { $exists: boolean } | { $gte: string } | { $ne: null } | null
        mapToKey?: string
    }
}
