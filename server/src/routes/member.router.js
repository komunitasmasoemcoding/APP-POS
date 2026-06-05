import { Router } from 'express';
import {
  createMember,
  getAllMembers,
  getMemberById,
  getMemberByBarcode,
  updateMember,
  deleteMember,
} from '../controller/member.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/rbac.js';

const memberRouter = Router();

memberRouter.get('/', authenticate, getAllMembers);
memberRouter.get('/barcode/:code', authenticate, getMemberByBarcode);
memberRouter.get('/:id', authenticate, getMemberById);
memberRouter.post(
  '/',
  authenticate,
  checkPermission('manage_members'),
  createMember
);
memberRouter.put(
  '/:id',
  authenticate,
  checkPermission('manage_members'),
  updateMember
);
memberRouter.delete(
  '/:id',
  authenticate,
  checkPermission('manage_members'),
  deleteMember
);

export default memberRouter;
