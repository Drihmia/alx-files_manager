import request from 'request';
import { expect } from 'chai';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../../utils/db';

describe('get Connect', function() {
  after(async () => {
    const ret = await dbClient.deleteUserById(userId);
    if (!ret) {
      console.log('error delete user');
    }
  });

  const email = `${uuidv4()}@gmail.com`;
  const password = 'password';
  let userId;
  it('returning status 201', function(done) {
    request.post({
      url:'http://localhost:5000/users',
      json: true,
      body : { email, password },
      headers: {
        'Content-Type': 'application/json'
      },
    }, (err, res, body) => {
      userId = body.id;
      expect(res.statusCode).to.equal(201);
      expect(res.request.method).to.equal('POST');
      expect(res.request.port).to.equal('5000');
      done();
    });
  });

  it('Create new user does not exist in database', async () => {

    const user = await dbClient.findUserBy({ email });

    expect(String(user._id)).to.equal(userId);
    expect(user.email).to.equal(email);
    expect(user.password).to.not.equal(password);
  });

  it('create User exist in database', (done) => {
    request.post({
      url:'http://localhost:5000/users',
      json: true,
      body : { email, password },
      headers: {
        'Content-Type': 'application/json'
      },
    }, (err, res, body) => {
      expect(res.statusCode).to.equal(400);
      expect(res.request.method).to.equal('POST');
      expect(res.request.port).to.equal('5000');
      expect(body.error).to.equal('Already exist');
      done();
    });
  });

  it('Missing password', (done) => {
    request.post({
      url:'http://localhost:5000/users',
      json: true,
      body : { email },
      headers: {
        'Content-Type': 'application/json'
      },
    }, (err, res, body) => {
      expect(res.statusCode).to.equal(400);
      expect(res.request.method).to.equal('POST');
      expect(res.request.port).to.equal('5000');
      expect(body.error).to.equal('Missing password');
      done();
    });
  });

  it('Missing email', (done) => {
    request.post({
      url:'http://localhost:5000/users',
      json: true,
      body : { password },
      headers: {
        'Content-Type': 'application/json'
      },
    }, (err, res, body) => {
      expect(res.statusCode).to.equal(400);
      expect(res.request.method).to.equal('POST');
      expect(res.request.port).to.equal('5000');
      expect(body.error).to.equal('Missing email');
      done();
    });
  });
});
