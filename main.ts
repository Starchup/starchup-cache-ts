const Redis = require('redis');

/**
 * Interfaces and local definitions
 */
export interface CacheObject
{
    [key: string]: any;
}

type PromiseArrayCallback = (res: Array < CacheObject > ) => void;
type PromiseErrCallback = (err: Error) => void;

export class Cache
{
    private Redis = Redis;
    private _cache: any;
    private dbQueryDelay: number;

    constructor(cacheHost: string, cachePort: string, dbQueryDelay: number = 1000)
    {
        this.dbQueryDelay = dbQueryDelay;
        this.closeAndConnectCache(cacheHost, cachePort);
    }

    /* Public methods */
    public findObj(modelName: string, key ? : string, value ? : any): Promise < CacheObject | undefined >
    {
        return this.findObjs(modelName, key, value).then((res) =>
        {
            if (res && res.length > 0) return res[0];
        });
    }

    public findObjs(modelName: string, key ? : string, value ? : any, retry ? : number): Promise < Array < CacheObject >>
    {
        return new Promise((resolve: PromiseArrayCallback, reject: PromiseErrCallback) =>
        {
            this._cache.get(modelName, (err: Error, res: string) =>
            {
                if (err) setTimeout(() =>
                {
                    reject(err);
                }, this.dbQueryDelay);
                else resolve(res ? JSON.parse(res) : []);
            });
        }).then((res) =>
        {
            if (res.length < 1) return res;
            if (!key || !value) return res;
            return res.filter(obj =>
            {
                return obj[key] === value;
            });
        }).catch((err: Error) =>
        {
            console.error('Cache got error: ' + modelName + ' ' + JSON.stringify(err));

            if (retry && retry >= 10) throw err;
            else return this.findObjs(modelName, key, value);
        });
    }

    private closeAndConnectCache(host: string, port: string): void
    {
        if (this._cache) this._cache.quit();
        this._cache = this.Redis.createClient(
        {
            host: host,
            port: port
        });
        this._cache.on('error', (err: Error) =>
        {
            console.error('Cache got error main: ' + JSON.stringify(err));
            this.closeAndConnectCache(host, port);
        });
    }
}