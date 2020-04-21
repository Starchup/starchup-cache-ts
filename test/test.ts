import test from 'ava';
import sinon from 'sinon';
import rewiremock from 'rewiremock';
import { EventEmitter } from 'events';

import { RedisStub } from './stubs/redis';

const redis = new RedisStub();

class RedisClientStub extends EventEmitter {
    get() {}
    quit() {}
}

const redisClientStub = new RedisClientStub();

redis.createClient = () => redisClientStub;

const { Cache } = rewiremock.proxy('../main.ts',
{
    redis
});

test.afterEach(() =>
{
    sinon.restore();
})

test.serial('findObj returns a result', async t =>
{
    const res = 'result';
    const stub = sinon.stub(redisClientStub, 'get').yields(null, JSON.stringify([res]));
    const cache = new Cache();
    const result = await cache.findObj('test');

    t.is(result, res);
});

test.serial('findObj throws an error', async t =>
{
    const err = new Error('error');
    const stub = sinon.stub(redisClientStub, 'get').yields(err);
    const cache = new Cache(null, null, 1);

    try
    {
        await cache.findObj('test');
    } catch (e)
    {
        t.is(err, e);
    }
});

test.serial('findObjs returns a result', async t =>
{
    const res = 'result';
    const stub = sinon.stub(redisClientStub, 'get').yields(null, JSON.stringify([res]));
    const cache = new Cache();
    const [result] = await cache.findObjs('test');

    t.is(result, res);
});

test.serial('findObjs throws an error', async t =>
{
    const err = new Error('error');
    const stub = sinon.stub(redisClientStub, 'get').yields(err);
    const cache = new Cache(null, null, 1);

    try
    {
        await cache.findObjs('test');
    } catch (e)
    {
        t.is(err, e);
    }
});

test.serial('findObjs returns a filtered result', async t =>
{
    const res = { test: 'test' }
    const stub = sinon.stub(redisClientStub, 'get').yields(null, JSON.stringify([res]));
    const cache = new Cache();
    const [result] = await cache.findObjs('test', 'test', 'test');

    t.deepEqual(result, res);
});

test.serial('findObjs returns no filtered results when no match', async t =>
{
    const res = { test2: 'test' }
    const stub = sinon.stub(redisClientStub, 'get').yields(null, JSON.stringify([res]));
    const cache = new Cache();
    const result = await cache.findObjs('test', 'test', 'test');

    t.deepEqual(result, []);
});

test.serial('cache quits on error', async t =>
{
    const err = new Error('error');
    const spy = sinon.spy(redisClientStub, 'quit');
    const stub = sinon.stub(redisClientStub, 'on');
    stub.onFirstCall().yields(err);
    const cache = new Cache();

    t.is(spy.calledOnce, true);
});
