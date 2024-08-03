import base64 from 'base-64';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const redisKey = `auth_${token}`;

    const userId = await redisClient.get(redisKey);
    console.log('usrID:', userId);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const {
      name, type, data, parentId = 0, isPublic = false,
    } = req.body;
    console.log(name, type, data, parentId, isPublic);

    if (name === undefined) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }
    if (type === undefined || !(['folder', 'file', 'image'].includes(type))) {
      res.status(400).json({ error: 'Missing type' });
      return;
    }

    // ------------------------------------------------------------------------
    // ----------------------------- Folders section --------------------------
    // ------------------------------------------------------------------------
    if (type === 'folder') {
      const query = {
        userId, name, type, isPublic, parentId,
      };
      const folder = await dbClient.findFileBy({ name, type });
      if (folder) {
        res.status(400).json({ error: 'Folder already exists' });
        return;
      }

      const id = await dbClient.createObject('files', query);
      res.status(201).json({
        id, userId, name, type, isPublic, parentId,
      });
      return;
    }

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++ Files section ++++++++++++++++++++++++++++
    // +++++++++++++++ Files section must be under folders section ++++++++++++
    // +++++++++++++++ or many conditions  under have to rewritten ++++++++++++

    if (data === undefined) {
      res.status(400).json({ error: 'Missing data' });
      return;
    }

    if (parentId) {
      const fileParent = dbClient.findFileById(parentId);
      if (!fileParent) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }

      if (fileParent.type !== 'folder') {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }

    const rootPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    console.log('rootPath:', rootPath);

    const query = {
      name, type, parentId, userId, isPublic, localPath: 'localPath',
    };

    const fileId = dbClient.createObject('files', query);
    console.log('fileId:', fileId);
    res.json({ userId });
  }
}

export default FilesController;
