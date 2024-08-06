import { MongoClient, ObjectId } from 'mongodb';

class DBClient {
  constructor() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '27017';
    const dbName = process.env.DB_DATABASE || 'files_manager';
    this.clientMGDB = MongoClient(`mongodb://${dbHost}:${dbPort}`);
    this.isConnected = false;

    this.clientMGDB.connect((err) => {
      if (!err) {
        this.isConnected = true;
        this.db = this.clientMGDB.db(dbName);
      }
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    const users = [];

    const colUsers = await this.db.collection('users');
    const numUsers = await colUsers.find({});

    for await (const doc of numUsers) {
      users.push(doc);
    }
    return users.length;
  }

  async nbFiles() {
    const files = [];

    const colFiles = await this.db.collection('files');
    const numFiles = await colFiles.find({});
    for await (const file of numFiles) {
      files.push(file);
    }
    return files.length;
  }

  async findUserBy(query, projection) {
    const collection = await this.db.collection('users');
    let user;
    try {
      user = await collection.findOne(query, { projection });
    } catch (_) {
      return false;
    }

    if (user === null) return false;

    return user;
  }

  async findFilesBy(query, projection) {
    const files = [];
    const collection = await this.db.collection('files');
    let user;
    try {
      user = await collection.find(DBClient._convertIds(query), { projection });
    } catch (_) {
      return files;
    }

    for await (const file of user) {
      files.push(file);
    }
    return files;
  }

  async findFileBy(query, projection) {
    const collection = await this.db.collection('files');
    let user;
    try {
      user = await collection.findOne(query, { projection });
    } catch (_) {
      return false;
    }

    if (user === null) return false;

    return user;
  }

  async findUserById(id, projection) {
    const collection = await this.db.collection('users');
    let user;
    try {
      user = await collection.findOne({ _id: ObjectId(id) },
        { projection });
    } catch (_) {
      return false;
    }

    if (user === null) return false;

    return user;
  }

  async findFileById(id, projection) {
    const collection = await this.db.collection('files');
    let user;
    try {
      user = await collection.findOne({ _id: ObjectId(id) },
        { projection });
    } catch (_) {
      return false;
    }
    if (user === null) return false;

    return user;
  }

  async createObject(colName, query) {
    const collection = await this.db.collection(colName);
    let res;
    try {
      res = await collection.insertOne(DBClient._convertIds(query));
      return res.ops[0]._id;
    } catch (_) {
      return false;
    }
    // return the id of created documents/objects
  }

  async filesPagination(res, page, size, projection) {
    const files = [];
    const collection = await this.db.collection('files');
    try {
      const docs = await collection.find(DBClient._convertIds(res), { projection });
      const paginatedUser = await docs.skip(page !== 0 ? (page * size) : 0).limit(size);
      for await (const file of paginatedUser) {
        files.push(file);
      }
      return files;
    } catch (error) {
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
      dataCopy.parentId = ObjectId(String(query.parentId));
    }
    return dataCopy;
  }

  async updateFileById(id, newValues) {
    // newValues are an objects like { name: 'new name', type: 'new type' }
    const collection = await this.db.collection('files');
    try {
      const res = await collection.updateOne({ _id: ObjectId(String(id)) }, { $set: newValues });
      return res;
    } catch (error) {
      return false;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
