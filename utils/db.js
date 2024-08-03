const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    if (process.env.DB_HOST) {
      this.host = process.env.DB_HOST;
    } else {
      this.host = '127.0.0.1';
    }
    if (process.env.DB_PORT) {
      this.port = process.env.DB_PORT;
    } else {
      this.port = 27017;
    }

    if (process.env.DB_DATABASE) {
      this.dbName = process.env.DB_DATABASE;
    } else {
      this.dbName = 'files_manager';
    }

    const url = `mongodb://${this.host}:${this.port}`;

    this.client = new MongoClient(url);
    this.client.connect()
      .then(() => {
        this.db = this.client.db(this.dbName);
      })
      .catch((err) => {
        console.error('Connection to MongoDB failed', err);
      });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const count = await this.db.collection('users').countDocuments();
    return count;
  }

  async nbFiles() {
    const count = await this.db.collection('files').countDocuments();
    return count;
  }
}
const dbClient = new DBClient();
module.exports = dbClient;
