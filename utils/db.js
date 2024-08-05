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
    let res;
    if ('userId' in query) {
      const dataCopy = { ...query };
      dataCopy.userId = ObjectId(query.userId);
      res = await collection.insertOne(dataCopy);
    } else {
      res = await collection.insertOne(query);
    }
    // return the id of created documents/objects
    return res.ops[0]._id;
  }

  async filesPagination(res, page, size, projection) {
    const files = [];
    const collection = await this.db.collection('files');
    const docs = await collection.find(DBClient._convertIds(res), { projection });
    const paginatedUser = await docs.skip(page !== 0 ? (page * size) : 0).limit(size);
    for await (const file of paginatedUser) {
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
      dataCopy.fileId = ObjectId(String(query.fileId));
    }
    return dataCopy;
  }

  async updateFileById(id, newValues) {
    // newValues are an objects like { name: 'new name', type: 'new type' }
    const collection = await this.db.collection('files');
    const res = await collection.updateOne({ _id: ObjectId(String(id)) }, { $set: newValues });
    return res;
  }
}

const dbClient = new DBClient();
export default dbClient;
