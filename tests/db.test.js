import { expect } from 'chai';
import dbClient from '../../utils/db';

describe('test MongoDB\'s database', () => {
  it('test isAlive', () => {
    expect(dbClient.isAlive()).to.be.true;
  });

  it('test nbUsers method', async () => {
    const nUsersI = await dbClient.nbUsers();
    const id = await dbClient.createObject('users', { red: 'dri' });
    const nUsersF = await dbClient.nbUsers();
    expect(nUsersF - nUsersI).to.equal(1);
  });

  it('test nbFiles method', async () => {
    const nFilesI = await dbClient.nbFiles();
    const id = await dbClient.createObject('files', { RED: 'dri' });
    const nFilesF = await dbClient.nbFiles();
    expect(nFilesF - nFilesI).to.equal(1);
  });
});
