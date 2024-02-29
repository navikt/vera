export interface ICheckresult {
    endpoint: string
    description: string
    //result?: number
    result: string
    responseTime?: string
    errorMessage?: string
    stackTrace?: string
}

export interface ISelftestResult {
    application: string
    version: string
    timestamp: string
    aggregateResult: number
    statusCode: number
    checks: ICheckresult[]
}
