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
    const user = await collection.findOne(query, { projection });
    if (user === null) return false;

    return user;
  }

  async findFilesBy(query, projection) {
    const files = [];
    const collection = await this.db.collection('files');
    const user = await collection.find(DBClient._convertIds(query), { projection });
    for await (const file of user) {
      files.push(file);
    }
    return files;
  }

  async findFileBy(query, projection) {
    const collection = await this.db.collection('files');
    const user = await collection.findOne(query, { projection });
    if (user === null) return false;

    return user;
  }

  async findUserById(id, projection) {
    const collection = await this.db.collection('users');
    const user = await collection.findOne({ _id: ObjectId(id) },
      { projection });
    if (user === null) return false;

    return user;
  }

  async findFileById(id, projection) {
    const collection = await this.db.collection('files');
    const user = await collection.findOne({ _id: ObjectId(id) },
      { projection });
    if (user === null) return false;

    return user;
  }

  async createObject(colName, query) {
    const collection = await this.db.collection(colName);
    const res = await collection.insertOne(query);
    // return the id of created documents/objects
    // return res.ops[0]._id;
    return res.insertedId;
  }

  async filesPagination(res, page, size, projection) {
    const files = [];
    const collection = await this.db.collection('files');
    const docs = await collection.find(DBClient._convertIds(res), { projection });
    const paginatedUsers = await docs.skip(page !== 0 ? (page * size) : 0).limit(size);
    for await (const file of paginatedUsers) {
      files.push(file);
    }
    return files;
  }

  static _convertIds(query) {
    const dataCopy = { ...query };
    if ('userId' in query) {
      dataCopy.userId = ObjectId(String(query.userId));
    }
    if ('fileId' in query) {
      dataCopy.fileId = ObjectId(query.fileId);
    }
    if ('parentId' in query) {
      const { parentId } = query;
      // checking if it's different from 0 (as number) is enough.
      // from task's 5 output, if parentId is 0, it's a string.
      // if it is a ID, it's an ObjectId.
      if (parentId !== 0 || parentId !== '0') {
        dataCopy.parentId = ObjectId(query.parentId);
      }
    }
    return dataCopy;
  }
}

const dbClient = new DBClient();
export default dbClient;
