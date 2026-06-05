import { Router } from 'express';
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from '../controller/category.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/rbac.js';

const categoryRouter = Router();

categoryRouter.get('/', authenticate, getAllCategories);
categoryRouter.post(
  '/',
  authenticate,
  checkPermission('manage_categories'),
  createCategory
);
categoryRouter.put(
  '/:id',
  authenticate,
  checkPermission('manage_categories'),
  updateCategory
);
categoryRouter.delete(
  '/:id',
  authenticate,
  checkPermission('manage_categories'),
  deleteCategory
);

export default categoryRouter;
