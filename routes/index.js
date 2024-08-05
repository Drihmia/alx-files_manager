import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const route = Router();
route.get('/status', AppController.getStatus);
route.get('/stats', AppController.getStats);
route.post('/users', UsersController.postNew);
route.get('/connect', AuthController.getConnect);
route.get('/disconnect', AuthController.getDisconnect);
route.get('/users/me', AuthController.getMe);
route.post('/files', FilesController.postUpload);
route.get('/files', FilesController.getIndex);
route.get('/files/:id', FilesController.getShow);
route.put('/files/:id/publish', FilesController.putPublish);
route.put('/files/:id/unpublish', FilesController.putUnpublish);
route.get('/files/:id/data', FilesController.getFile);

export default route;
