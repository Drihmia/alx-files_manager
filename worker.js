import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';
import { promises as fs } from 'fs';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue');
const userQueue = new Queue('userQueue');

fileQueue.process(async (job, done) => {
  const { userId, fileId } = job.data;
  if (!fileId) return done(new Error('Missing fileId'));
  if (!userId) return done(new Error('Missing userId'));

  let file;
  try {
    file = await dbClient.findFileById(fileId);
  } catch (_) {
    done(new Error('File not found'));
  }
  if (!file) return done(new Error('File not found'));

  if (String(file.userId) !== userId) return done(new Error('File not found'));

  const location = file.localPath;
  if (!location) return done(new Error('File not found'));

  const options = [500, 250, 100];

  try {
    await Promise.all(options.map(async (size) => {
      const thumbnail = await imageThumbnail(location, { width: size });
      const thumbnailPath = `${location}_${size}`;
      await fs.writeFile(thumbnailPath, thumbnail);
    }));
    done();
  } catch (_) {
    return done(new Error('-----'));
  }
});

userQueue.process(async (job, done) => {
  const { userId } = job.data;
  if (!userId) return done(new Error('Missing userId'));

  let user;
  try {
    user = await dbClient.findUserById(userId);
  } catch (_) {
    return done(new Error('File not found'));
  }
  if (!user) return done(new Error('User not found'));

  console.log(`Welcome ${user.email}`);
  done();
});
