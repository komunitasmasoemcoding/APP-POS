import { Router } from 'express';
import { getSalesSummary, getTopProducts, getSalesGraph } from '../controller/analytics.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/summary', checkPermission('view_reports'), getSalesSummary);
router.get('/top-products', checkPermission('view_reports'), getTopProducts);
router.get('/sales-graph', checkPermission('view_reports'), getSalesGraph);

export default router;
