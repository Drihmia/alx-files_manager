import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    if (!redisClient.isAlive()) return;
    if (!dbClient.isAlive()) return;
    res.json({ redis: true, db: true });
  }

  static async getStats(req, res) {
    const nUsers = await dbClient.nbUsers();
    const nFiles = await dbClient.nbFiles();
    const obj = {
      users: nUsers,
      files: nFiles,
    };

    res.json(obj);
  }
}
export default AppController;
