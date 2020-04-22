/**
 * Interfaces and local definitions
 */
export interface CacheObject {
    [key: string]: any;
}
export declare class Cache {
    private Redis;
    private _cache;
    private dbQueryDelay;
    constructor(cacheHost: string, cachePort: string, dbQueryDelay?: number);
    findObj(modelName: string, key?: string, value?: any): Promise<CacheObject | undefined>;
    findObjs(modelName: string, key?: string, value?: any, retry?: number): Promise<Array<CacheObject>>;
    private closeAndConnectCache;
}
