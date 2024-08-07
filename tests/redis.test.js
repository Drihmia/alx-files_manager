import { expect } from 'chai';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../../utils/redis';

describe('test Redis\'s server', () => {
  let randomKey;
  it('test isAlive', () => {
    expect(redisClient.isAlive()).to.be.true;
  });

  it('test get method on non existing key', async () => {
    const res = await redisClient.get('fake key');
    expect(res).to.be.not.false;
  });

  it('test set method', async () => {
    randomKey = uuidv4();
    await redisClient.set(randomKey, 'fake value', 20);
    const res = await redisClient.get(randomKey);
    expect(res).to.equal('fake value');
  });
  it('test del method', async () => {
    await redisClient.del(randomKey);
    const res = await redisClient.get(randomKey);
    expect(res).to.be.null;
  });
});
