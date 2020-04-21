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
    const expectedResult = 'result';
    sinon.stub(redisClientStub, 'get').yields(null, JSON.stringify([expectedResult]));
    const cache = new Cache();
    const actualResult = await cache.findObj('test');

    t.is(actualResult, expectedResult);
});

test.serial('findObj throws an error', async t =>
{
    const err = new Error('error');
    sinon.stub(redisClientStub, 'get').yields(err);
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
    const expectedResult = 'result';
    sinon.stub(redisClientStub, 'get').yields(null, JSON.stringify([expectedResult]));
    const cache = new Cache();
    const [actualResult] = await cache.findObjs('test');

    t.is(actualResult, expectedResult);
});

test.serial('findObjs throws an error', async t =>
{
    const err = new Error('error');
    sinon.stub(redisClientStub, 'get').yields(err);
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
    const expectedResult = { test: 'test' }
    sinon.stub(redisClientStub, 'get').yields(null, JSON.stringify([expectedResult]));
    const cache = new Cache();
    const [actualResult] = await cache.findObjs('test', 'test', 'test');

    t.deepEqual(actualResult, expectedResult);
});

test.serial('findObjs returns no filtered results when no match', async t =>
{
    const nonExpectedResult = { test2: 'test' }
    sinon.stub(redisClientStub, 'get').yields(null, JSON.stringify([nonExpectedResult]));
    const cache = new Cache();
    const actualResult = await cache.findObjs('test', 'test', 'test');

    t.deepEqual(actualResult, []);
});

test.serial('cache quits on error', async t =>
{
    const err = new Error('error');
    const quitSpy = sinon.spy(redisClientStub, 'quit');
    const onStub = sinon.stub(redisClientStub, 'on');
    onStub.onFirstCall().yields(err);
    const cache = new Cache();

    t.is(quitSpy.calledOnce, true);
});
