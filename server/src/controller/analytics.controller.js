import prisma from '../utils/prisma.js';

export const getSalesSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [todaySales, yesterdaySales] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
          status: { in: ['PREPARING', 'COMPLETED'] },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: yesterday, lt: today },
          status: { in: ['PREPARING', 'COMPLETED'] },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
    ]);

    res.status(200).json({
      today: {
        revenue: todaySales._sum.totalAmount || 0,
        orders: todaySales._count.id || 0,
      },
      yesterday: {
        revenue: yesterdaySales._sum.totalAmount || 0,
        orders: yesterdaySales._count.id || 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const topVariants = await prisma.orderItem.groupBy({
      by: ['variantId'],
      where: {
        order: {
          status: { in: ['PREPARING', 'COMPLETED'] },
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const detailedTopProducts = await Promise.all(
      topVariants.map(async (v) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: v.variantId },
          include: { product: true },
        });
        return {
          variantId: v.variantId,
          sku: variant.sku,
          productName: variant.product.name,
          totalSold: v._sum.quantity,
          totalRevenue: v._sum.subtotal,
        };
      })
    );

    res.status(200).json(detailedTopProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSalesGraph = async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    const sales = await prisma.order.findMany({
      where: {
        createdAt: { gte: last7Days },
        status: { in: ['PREPARING', 'COMPLETED'] },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const dateKeys = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(last7Days);
      date.setDate(last7Days.getDate() + index);
      return date.toISOString().slice(0, 10);
    });

    const groupedData = sales.reduce((acc, order) => {
      const date = order.createdAt.toISOString().slice(0, 10);
      acc[date] = acc[date] || { revenue: 0, orders: 0 };
      acc[date].revenue += Number(order.totalAmount);
      acc[date].orders += 1;
      return acc;
    }, {});

    const graphData = dateKeys.map((date) => ({
      date,
      revenue: groupedData[date]?.revenue || 0,
      orders: groupedData[date]?.orders || 0,
    }));

    res.status(200).json(graphData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
