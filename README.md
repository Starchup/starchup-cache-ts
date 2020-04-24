Starchup Redis Cache
=========================

Simple cache system written in TypeScript based on Redis.

### Usage

Create a new cache object
```
const cache: Cache = new Cache('redis', '6379');
```

### Examples

Find an object

```
const agent = await cache.findObj('Agent', 'userId', userId);
```

Find objects

```
const facilities = await cache.findObjs(app, 'Facility', 'organizationId', orgId);
```

### Notes

If there is an error with the Redis connection, the cache object will attempt to reconnect automatically.
