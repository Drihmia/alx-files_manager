import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => console.log('Error from Redis client:', err));
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
    this.pingAsync = promisify(this.client.ping).bind(this.client);

    // Connection status
    this._isConnected = false;

    this.client.on('connect', () => {
      // console.log('Connected to Redis');
      this._isConnected = true;
    });

    this.client.on('ready', () => {
      // console.log('Redis client is ready');
      this._isConnected = true;
    });
  }

  async __isConnected() {
    try {
      const res = await this.pingAsync();
      console.log(`Ping response from Redis: ${res}`);
      return res === 'PONG';
    } catch (err) {
      console.log(`Error while pinging Redis: ${err}`);
      return false;
    }
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    const red = await this.setAsync(key, value, 'EX', duration);
    if (!red) {
      console.log(`Error while setting ${key} in redis: ${red}`);
    }
  }

  async del(key) {
    const res = await this.delAsync(key);
    if (!res) {
      console.log(`Error while deleting ${key} in redis: ${res}`);
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
