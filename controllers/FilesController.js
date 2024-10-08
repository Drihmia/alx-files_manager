import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { lookup } from 'mime-types';
import Queue from 'bull';
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
    if (parentId === '0') parentId = 0;

    if (name === undefined) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }
    if (type === undefined || !(['folder', 'file', 'image'].includes(type))) {
      res.status(400).json({ error: 'Missing type' });
      return;
    }

    let fileParent;
    if (parentId) {
      try {
        fileParent = await dbClient.findFileById(parentId);
      } catch (_) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }

      if (!fileParent) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (fileParent.type !== 'folder') {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
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
      if (!id) {
        res.status(400).json({});
        return;
      }
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

    try {
      await fs.mkdir(rootPath, { recursive: true });
    } catch (_) {
      res.status(400).json({});
      return;
    }

    // The full path of the file
    const localPath = `${rootPath}/${uuidv4()}`;

    try {
      const buffer = Buffer.from(data, 'base64');
      await fs.writeFile(localPath, buffer);
    } catch (_) {
      res.status(400).json({});
      return;
    }

    const query = {
      name, type, parentId, userId, isPublic, localPath,
    };

    const file = await dbClient.findFileBy({ name, type });
    if (file) {
      res.status(400).json({ error: `${type} already exists` });
      return;
    }
    const id = await dbClient.createObject('files', query);
    if (!id) {
      res.status(400).json({});
      return;
    }

    if (type === 'image') {
      const fileQueue = new Queue('fileQueue');
      fileQueue.add({ userId, fileId: id });
    }

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

    const { id } = req.params;

    let file;
    try {
      file = await dbClient.findFileById(id);
    } catch (_) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

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

    let user;
    try {
      user = await dbClient.findUserById(userId);
    } catch (_) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let { page = 0 } = req.query;
    const { parentId = '0' } = req.query;

    let files;
    // Query in request send all args as string.
    page = Number(page);
    // Checking if the page is negative
    if (page < 0) page = 0;

    files = await dbClient.filesPaginationPipeline({ userId, parentId }, page, 20);
    files = files.map(({ _id: id, ...rest }) => ({ id, ...rest }));
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
    let file;
    try {
      file = await dbClient.findFileById(id);
    } catch (_) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

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
    let file;
    try {
      file = await dbClient.findFileById(id);
    } catch (_) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

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

    let file;
    try {
      file = await dbClient.findFileById(id);
    } catch (_) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

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
      // Check if the authenticagetFileted user is the owner of the file
      if (userId !== String(file.userId)) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
    }

    const { type } = file;
    if (type === 'folder') {
      res.status(400).json({ error: 'A folder doesn\'t have content' });
      return;
    }

    let localPath;
    if (type === 'image') {
      const { size } = req.query;
      if (size && ['500', '250', '100'].includes(size)) {
        localPath = `${file.localPath}_${size}`;
      }
    } else {
      localPath = file.localPath;
    }

    try {
      const data = await fs.readFile(localPath);
      const mimeType = lookup(file.name);
      res.setHeader('Content-Type', mimeType);
      res.send(data);
    } catch (_) {
      res.status(404).json({ error: 'Not found' });
    }
  }
}

export default FilesController;
