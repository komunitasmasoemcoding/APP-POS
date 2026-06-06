import { Router } from 'express';
import { adjustStock, getStockLevel } from '../controller/stock.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/rbac.js';

const stockRouter = Router();

stockRouter.get('/:variantId', authenticate, getStockLevel);
stockRouter.post(
  '/adjust',
  authenticate,
  checkPermission('manage_stock'),
  adjustStock
);

export default stockRouter;
