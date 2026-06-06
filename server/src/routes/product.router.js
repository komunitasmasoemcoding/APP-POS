import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  getVariantByBarcode,
  updateProduct,
  deleteProduct,
} from '../controller/product.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/rbac.js';
import { upload } from '../middlewares/upload.js';

const productRouter = Router();

productRouter.get('/', authenticate, getAllProducts);
productRouter.get('/variants/barcode/:code', authenticate, getVariantByBarcode);
productRouter.get('/:id', authenticate, getProductById);
productRouter.post(
  '/',
  authenticate,
  checkPermission('manage_products'),
  upload.single('image'),
  createProduct
);
productRouter.put(
  '/:id',
  authenticate,
  checkPermission('manage_products'),
  upload.single('image'),
  updateProduct
);
productRouter.delete(
  '/:id',
  authenticate,
  checkPermission('manage_products'),
  deleteProduct
);

export default productRouter;
