import { MongoClient } from 'mongodb';

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

  async findUserByEmail(email) {
    const collection = await this.db.collection('users');
    const user = await collection.findOne({ email });
    if (user === null) return false;

    return user;
  }

  async createObject(colName, data) {
    const collection = await this.db.collection(colName);
    const res = await collection.insertOne(data);
    // return the id of created documents/objects
    return res.ops[0]._id;
  }
}

const dbClient = new DBClient();
export default dbClient;
