import {Router} from 'express';
import userRouter from './user.router.js';
import categoryRouter from './category.router.js';
import productRouter from './product.router.js';
import stockRouter from './stock.router.js';
import memberRouter from './member.router.js';
import orderRouter from './order.router.js';
import analyticsRouter from './analytics.router.js';

const router = Router();


router.use('/api', userRouter);
router.use('/api/categories', categoryRouter);
router.use('/api/products', productRouter);
router.use('/api/stock', stockRouter);
router.use('/api/members', memberRouter);
router.use('/api/orders', orderRouter);
router.use('/api/analytics', analyticsRouter);

router.use('/*splat', (req, res) => {
    res.status(404).json(
        {
            message: 'Not Found'
        }
    );
});

export default router;

