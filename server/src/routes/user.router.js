import {Router} from 'express';
import {doLogin, getMe, getAllUsers, createUser, deleteUser, getAllRoles} from '../controller/user.controller.js';
import {authenticate} from '../middlewares/auth.js';
import {checkPermission} from '../middlewares/rbac.js';

const userRouter = Router();

userRouter.post('/login', doLogin);
userRouter.get('/me', authenticate, getMe);

// Admin-only management
userRouter.get('/users', authenticate, checkPermission('manage_users'), getAllUsers);
userRouter.post('/users', authenticate, checkPermission('manage_users'), createUser);
userRouter.delete('/users/:id', authenticate, checkPermission('manage_users'), deleteUser);
userRouter.get('/roles', authenticate, checkPermission('manage_users'), getAllRoles);

export default userRouter;
