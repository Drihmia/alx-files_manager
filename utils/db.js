import { MongoClient, ObjectId } from 'mongodb';

class DBClient {
  constructor() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '27017';
    const dbName = process.env.DB_DATABASE || 'files_manager';
    const clientMGDB = new MongoClient(`mongodb://${dbHost}:${dbPort}`, { useUnifiedTopology: true });
    this.isConnected = false;

    clientMGDB.connect((err) => {
      if (!err) {
        this.isConnected = true;
        this.db = clientMGDB.db(dbName);
        this.colUsers = this.db.collection('users');
        this.colFiles = this.db.collection('files');
      }
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    return this.colUsers.countDocuments();
  }

  async nbFiles() {
    return this.colFiles.countDocuments();
  }

  async findUserBy(query, projection) {
    let user;
    try {
      user = await this.colUsers.findOne(DBClient._convertIds(query), { projection });
    } catch (_) {
      return false;
    }

    if (user === null) return false;

    return user;
  }

  async findFilesBy(query, projection) {
    let filesCursor;
    try {
      filesCursor = this.colFiles.find(DBClient._convertIds(query), { projection });
    } catch (_) {
      return [];
    }

    return filesCursor.toArray();
  }

  async findFileBy(query, projection) {
    let user;
    try {
      user = await this.colFiles.findOne(DBClient._convertIds(query), { projection });
    } catch (_) {
      return false;
    }

    if (user === null) return false;

    return user;
  }

  async findUserById(id, projection) {
    let user;
    try {
      user = await this.colUsers.findOne({ _id: ObjectId(id) },
        { projection });
    } catch (_) {
      return false;
    }

    if (user === null) return false;

    return user;
  }

  async findFileById(id, projection) {
    let user;
    try {
      user = await this.colFiles.findOne({ _id: ObjectId(id) },
        { projection });
    } catch (_) {
      return false;
    }
    if (user === null) return false;

    return user;
  }

  async createObject(colName, query) {
    const collection = { users: this.colUsers, files: this.colFiles };
    let res;
    try {
      res = await collection[colName].insertOne(DBClient._convertIds(query));
      return res.insertedId;
    } catch (_) {
      return false;
    }
  }

  async filesPagination(res, page, size, projection) {
    try {
      const docs = await this.colFiles.find(DBClient._convertIds(res), { projection });
      const paginatedUser = await docs.skip(page * size).limit(size);
      return paginatedUser.toArray();
    } catch (_) {
      return false;
    }
  }

  async filesPaginationPipeline(res, page, size) {
    try {
      const pipeline = [
        { $match: DBClient._convertIds(res) },
        { $skip: page * size },
        { $limit: size },
      ];

      const docs = await this.colFiles.aggregate(pipeline).toArray();
      return docs;
    } catch (_) {
      return false;
    }
  }

  static _convertIds(query) {
    const dataCopy = { ...query };
    if ('userId' in query) {
      dataCopy.userId = ObjectId(String(query.userId));
    }
    if ('fileId' in query) {
      dataCopy.fileId = ObjectId(String(query.fileId));
    }
    if ('parentId' in query) {
      const { parentId } = query;
      if (parentId !== 0 && parentId !== '0') {
        dataCopy.parentId = ObjectId(String(parentId));
      }
    }
    return dataCopy;
  }

  async updateFileById(id, newValues) {
    // newValues are an objects like { name: 'new name', type: 'new type' }
    try {
      const res = await this.colFiles.updateOne({ _id: ObjectId(String(id)) }, { $set: newValues });
      return res;
    } catch (_) {
      return false;
    }
  }

  async deleteUserById(id) {
    try {
      const res = await this.colUsers.deleteOne({ _id: ObjectId(String(id)) });
      return res;
    } catch (_) {
      return false;
    }
  }

  async deleteFileById(id) {
    try {
      const res = await this.colFiles.deleteOne({ _id: ObjectId(String(id)) });
      return res;
    } catch (_) {
      return false;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
