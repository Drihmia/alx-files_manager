import request from 'request';
import { expect } from 'chai';
import dbClient from '../../utils/db';

describe('Get Stats', function() {
  it('returning status 200', function(done) {
    request('http://localhost:5000/stats', (err, res, body) => {
      expect(res.statusCode).to.equal(200);
      expect(res.request.method).to.equal('GET');
      expect(res.request.port).to.equal('5000');
      done();
    });
  });

  it('should return  and objecct with users and files fileds', (done) => {
    request('http://localhost:5000/stats', (err, res, body) => {
      const { users, files } = JSON.parse(res.body);

      expect(users).to.not.be.undefined;
      expect(files).to.not.be.undefined;
      done();
    });
  });

  it('should return { "users": <NUMBER>,"files": <NUMBER> }', (done) => {
    request('http://localhost:5000/stats', (err, res, body) => {
      const { users, files } = JSON.parse(res.body);

      expect(users).to.be.be.a('number');
      expect(files).to.be.be.a('number');
      done();
    });
  });

  it('should return the right output', (done) => {
    request('http://localhost:5000/stats', async (err, res, body) => {
      const Dusers = await dbClient.nbUsers();
      const Dfiles = await dbClient.nbFiles();
      const { users, files } = JSON.parse(res.body);

      expect(users).to.equal(Dusers);
      expect(files).to.equal(Dfiles);
      done();
    });
  });
});
