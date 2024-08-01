import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '27017';
    const dbName = process.env.DB_DATABASE || 'files_manager';
    console.log('db:', dbName);
    this.clientMGDB = MongoClient(`mongodb://${dbHost}:${dbPort}`);
    this.isConnected = false;

    this.clientMGDB.connect((err) => {
      if (!err) {
        this.isConnected = true;
      }
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    const users = [];

    const db = this.clientMGDB.db(this.dbName);
    const colUsers = db.collection('users');
    const numUsers = colUsers.find({});

    for await (const doc of numUsers) {
      users.push(doc);
    }
    return users.length;
  }

  async nbFiles() {
    const files = [];

    const db = await this.clientMGDB.db(this.dbName);
    const colFiles = await db.collection('files');
    const numFiles = await colFiles.find({});
    for await (const file of numFiles) {
      files.push(file);
    }
    return files.length;
  }
}

const dbClient = new DBClient();
export default dbClient;
