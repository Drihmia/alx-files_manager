import base64 from 'base-64';
import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    // Get the authorization header: "Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=".
    const { authorization } = { ...req.headers };

    // Split only the base64's string: "Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=".
    const base64String = authorization.slice(6);

    // Decode the base64's string into the original string: "bob@dylan.com:toto1234!".
    const userData = base64.decode(base64String);

    // Get the email and the password variables.
    const [email, password] = userData.split(':');

    // Get the User from database, if does not exist send 401 "Unauthorized" error response.
    const userDoc = await dbClient.findUserBy({ email, password: sha1(password) },
      // retrieve only the _id, using projection in MongoDB.
      { password: 0, email: 0 });
    if (!userDoc) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!redisClient.isAlive()) {
      res.status(500).json({ error: 'Redis is offline, check "/status" first' });
      return;
    }

    const token = uuidv4();
    const redisKey = `auth_${token}`;

    // Set Redis key with User ID for 24h.
    redisClient.set(redisKey, String(userDoc._id), 24 * 3600);

    res.json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    const redisKey = `auth_${token}`;

    // const userId = await redisClient.get(redisKey);
    // if (userId === null) {
    // res.status(401).json({ error: 'Unauthorized' });
    // return;
    // }

    // I've made redisClient.del() return number of deleted keys,
    // so I can check if the key existed and was deleted.
    // If it was not deleted, it means the token is invalid.
    // And I can return 401 Unauthorized.
    const val = await redisClient.del(redisKey);
    if (!val) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.status(204).end();
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const redisKey = `auth_${token}`;

    // Get the User ID from Redis based on the token.
    const userId = await redisClient.get(redisKey);

    // If the token is invalid, send 401 "Unauthorized" error response.
    if (userId === null) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get the User's email from database based on the User ID retrieved from Redis.
    const userDoc = await dbClient.findUserById(userId, { password: 0, _id: 0 });

    console.log('userDoc:', userDoc);

    // Double check if the User exists, if not send 401 "Unauthorized" error response.
    if (!userDoc) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.json({ id: userId, email: userDoc.email });
  }
}

export default AuthController;
