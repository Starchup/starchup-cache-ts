"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Redis = require('redis');
var Cache = /** @class */ (function () {
    function Cache(cacheHost, cachePort, dbQueryDelay) {
        if (dbQueryDelay === void 0) { dbQueryDelay = 1000; }
        this.Redis = Redis;
        this.dbQueryDelay = 1000;
        this.dbQueryDelay = dbQueryDelay;
        this.closeAndConnectCache(cacheHost, cachePort);
    }
    /* Public methods */
    Cache.prototype.findObj = function (modelName, key, value) {
        return this.findObjs(modelName, key, value).then(function (res) {
            if (res && res.length > 0)
                return res[0];
        });
    };
    Cache.prototype.findObjs = function (modelName, key, value, retry) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._cache.get(modelName, function (err, res) {
                if (err)
                    setTimeout(function () {
                        reject(err);
                    }, _this.dbQueryDelay);
                else
                    resolve(res ? JSON.parse(res) : []);
            });
        }).then(function (res) {
            if (res.length < 1)
                return res;
            if (!key || !value)
                return res;
            return res.filter(function (obj) {
                return obj[key] === value;
            });
        }).catch(function (err) {
            console.error('Cache got error: ' + modelName + ' ' + JSON.stringify(err));
            if (retry && retry >= 10)
                throw err;
            else
                return _this.findObjs(modelName, key, value, retry ? ++retry : 1);
        });
    };
    Cache.prototype.closeAndConnectCache = function (host, port) {
        var _this = this;
        if (this._cache)
            this._cache.quit();
        this._cache = this.Redis.createClient({
            host: host,
            port: port
        });
        this._cache.on('error', function (err) {
            console.error('Cache got error main: ' + JSON.stringify(err));
            _this.closeAndConnectCache(host, port);
        });
    };
    return Cache;
}());
exports.Cache = Cache;
