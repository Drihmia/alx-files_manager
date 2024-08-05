import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { lookup } from 'mime-types';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const redisKey = `auth_${token}`;

    const userId = await redisClient.get(redisKey);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const {
      name, type, data, isPublic = false,
    } = req.body;
    let { parentId = 0 } = req.body;
    if (parentId === '0') parentId = Number(parentId);

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

    // Where to save all files
    const rootPath = process.env.FOLDER_PATH || '/tmp/files_manager';

    let fileParent;
    if (parentId) {
      fileParent = await dbClient.findFileById(parentId);
      if (!fileParent) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (fileParent.type !== 'folder') {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }

    try {
      await fs.mkdir(rootPath, { recursive: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    // The full path of the file
    const localPath = `${rootPath}/${uuidv4()}`;

    try {
      await fs.writeFile(localPath, data, 'base64');
    } catch (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    const query = {
      name, type, parentId, userId, isPublic, localPath,
    };

    const id = await dbClient.createObject('files', query);

    res.status(201).json({
      id, userId, name, type, isPublic, parentId,
    });
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const redisKey = `auth_${token}`;

    const userId = await redisClient.get(redisKey);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // const user = await dbClient.findUserById(userId);
    // if (!userId) {
    // res.status(401).json({ error: 'Unauthorized' });
    // return;
    // }

    const { id } = req.params;

    const file = await dbClient.findFileById(id);

    if (userId !== String(file.userId)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const redisKey = `auth_${token}`;

    const userId = await redisClient.get(redisKey);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await dbClient.findUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let { parentId, page } = req.query;
    if (parentId) parentId = Number(parentId);

    let files;
    if (!Number.isNaN(page)) {
      if (page) page = Number(page);
      files = await dbClient.filesPagination({ userId, parentId }, page, 20);
    } else {
      files = await dbClient.findFilesBy({ userId, parentId });
    }
    res.json(files);
  }

  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    const redisKey = `auth_${token}`;

    const userId = await redisClient.get(redisKey);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const file = await dbClient.findFileById(id);

    if (userId !== String(file.userId)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const isPublic = true;
    await dbClient.updateFileById(id, { isPublic });

    res.status(200).json({ ...file, isPublic });
  }

  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    const redisKey = `auth_${token}`;

    const userId = await redisClient.get(redisKey);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const file = await dbClient.findFileById(id);

    if (userId !== String(file.userId)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const isPublic = false;
    await dbClient.updateFileById(id, { isPublic });

    res.status(200).json({ ...file, isPublic });
  }

  static async getFile(req, res) {
    const { id } = req.params;
    if (!id) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const file = await dbClient.findFileById(id);
    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    if (file.isPublic === false) {
      const token = req.headers['x-token'];
      const redisKey = `auth_${token}`;

      const userId = await redisClient.get(redisKey);
      if (!userId) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
    }

    if (file.type === 'folder') {
      res.status(400).json({ error: 'A folder doesn\'t have content' });
      return;
    }

    try {
      const data = await fs.readFile(file.localPath, 'utf8');
      console.log(file.localPath);
      const mimeType = lookup(file.name);
      console.log('mimeType', mimeType);
      res.setHeader('Content-Type', mimeType);
      res.send(data);
    } catch (err) {
      res.status(500).json(err);
    }
  }
}

export default FilesController;
