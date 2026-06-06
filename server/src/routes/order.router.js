import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controller/order.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/rbac.js';

const orderRouter = Router();

orderRouter.get('/', authenticate, getAllOrders);
orderRouter.get('/:id', authenticate, getOrderById);
orderRouter.post('/', authenticate, checkPermission('process_sales'), createOrder);
orderRouter.patch(
  '/:id/status',
  authenticate,
  checkPermission('process_sales'), // Or manage_orders
  updateOrderStatus
);

export default orderRouter;
