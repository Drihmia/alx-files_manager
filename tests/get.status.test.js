import request from 'request';
import { expect } from 'chai';

describe('Get Status', function() {
  it('returning status 200', function(done) {
    request('http://localhost:5000/status', (err, res, body) => {
      expect(res.statusCode).to.equal(200);
      expect(res.request.method).to.equal('GET');
      expect(res.request.port).to.equal('5000');
      done();
    });
  });

    it('should return {"redis":true,"db":true}', (done) => {
      request('http://localhost:5000/status', (err, res, body) => {
      expect(res.body).to.equal(JSON.stringify({ redis :true, db:true }));
    });
      done();
  });
});
