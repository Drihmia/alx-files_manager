import request from 'request';
import { expect } from 'chai';
import sha1 from 'sha1';
import dbClient from '../utils/db';

let token;

describe('get Connect', () => {
  let userId;
  let userEmail;
  let created = false;

  before(async () => {
    // Wait for database's connection to estabish.
    while (!dbClient.isAlive()) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Create a user if it doesn't exist.
    let user = await dbClient.findUserBy({ email: 'bob@dylan.com' });
    if (!user) {
      const id = await dbClient.createObject('users', {
        email: 'bob@dylan.com', password: sha1('toto1234!'),
      });
      if (id) {
        created = true;
      }
      user = await dbClient.findUserBy({ email: 'bob@dylan.com' });
    }
    userId = user._id;
    userEmail = user.email;
  });

  after(async () => {
    if (created) {
      const ret = await dbClient.deleteUserById(userId);
      if (!ret.result.ok) {
        console.log('error delete user');
      }
    }
  });

  it('connect with status 200, should return a token', () => new Promise((done) => {
    const headers = { Authorization: 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=' };
    const url = 'http://localhost:5000/connect';
    request({ url, method: 'GET', headers }, (err, res, body) => {
      token = JSON.parse(res.body).token;
      expect(res.statusCode).to.equal(200);
      expect(res.request.method).to.equal('GET');
      expect(res.request.port).to.equal('5000');
      done();
    });
  }));

  it('connect with status 401, with Unauthorized error', () => new Promise((done) => {
    const headers = { Authorization: 'Basic fake_base64_string' };
    const url = 'http://localhost:5000/connect';
    request({ url, method: 'GET', headers }, (err, res, body) => {
      const { error } = JSON.parse(res.body);
      expect(res.statusCode).to.equal(401);
      expect(res.request.method).to.equal('GET');
      expect(res.request.port).to.equal('5000');
      expect(error).to.equal('Unauthorized');
      done();
    });
  }));

  it('reconnect with status 200, should return a new different token', () => new Promise((done) => {
    const headers = { Authorization: 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=' };
    const url = 'http://localhost:5000/connect';
    request({ url, method: 'GET', headers }, (err, res, body) => {
      expect(JSON.parse(res.body).token).to.not.equal(token);
      done();
    });
  }));

  it('should return  and object with id and files email of the authenticated user by token', () => new Promise((done) => {
    const headers = { 'X-Token': token };
    const url = 'http://localhost:5000/users/me';
    request({ url, method: 'GET', headers }, (err, res, body) => {
      const { id, email } = JSON.parse(res.body);

      expect(id).to.not.be.undefined;
      expect(email).to.not.be.undefined;
      done();
    });
  }));

  it('should return same object with same email and if for same user\'s token', () => new Promise((done) => {
    const headers = { 'X-Token': token };
    const url = 'http://localhost:5000/users/me';
    request({ url, method: 'GET', headers }, (err, res, body) => {
      const { id, email } = JSON.parse(res.body);

      expect(id).to.equal(String(userId));
      expect(email).to.equal(userEmail);
      done();
    });
  }));

  it('could not return user, wrong token, respond with Unauthorized error', () => new Promise((done) => {
    const headers = { 'X-Token': 'fake token' };
    const url = 'http://localhost:5000/users/me';
    request({ url, method: 'GET', headers }, (err, res, body) => {
      const { error } = JSON.parse(res.body);

      expect(error).to.equal('Unauthorized');
      done();
    });
  }));

  it('unauthorized user, could not disconnect', () => new Promise((done) => {
    const headers = { 'X-Token': 'fake token' };
    const url = 'http://localhost:5000/disconnect';
    request({ url, method: 'GET', headers }, (err, res, body) => {
      const { error } = JSON.parse(res.body);

      expect(error).to.equal('Unauthorized');
      done();
    });
  }));

  it('disconnect successfully with 204, with no response', () => new Promise((done) => {
    const headers = { 'X-Token': token };
    const url = 'http://localhost:5000/disconnect';
    request({ url, method: 'GET', headers }, (err, res, body) => {
      expect(res.statusCode).to.equal(204);
      expect(body).to.equal('');
      done();
    });
  }));
});
