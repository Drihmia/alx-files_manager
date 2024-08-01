import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = { ...req.body };
    if (email === undefined) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (password === undefined) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const user = await dbClient.findUserByEmail(email);
    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }

    // Create User
    const id = await dbClient.createObject('users', { email, password: sha1(password) });
    res.json({ id, email });
  }
}

export default UsersController;
