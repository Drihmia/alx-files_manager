import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (email === undefined) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (password === undefined) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    // Check if email already exist, we don't need attributes
    const user = await dbClient.findUserBy({ email },
      // Exclude password, _id and email and return an empty createObject
      { password: 0, _id: 0, email: 0 });
    // Return an empty object in this case is enough to check if user exist
    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }

    // Create User
    const id = await dbClient.createObject('users', { email, password: sha1(password) });
    res.status(201).json({ id, email });
  }
}

export default UsersController;
