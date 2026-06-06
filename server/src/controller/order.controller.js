import prisma from '../utils/prisma.js';
import { validateOrder } from '../validation/order.validation.js';

const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${date}-${random}`;
};

export const createOrder = async (req, res) => {
  const { error, value } = validateOrder(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      let totalSubtotal = 0;
      let totalDiscount = 0;
      const orderItemsData = [];
      const stockLedgerData = [];

      // Fetch member if provided to get discounts
      let member = null;
      if (value.memberId) {
        member = await tx.member.findUnique({ where: { id: value.memberId } });
        if (!member) throw new Error('Member not found');
      }

      for (const item of value.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: { include: { category: true } } },
        });

        if (!variant) throw new Error(`Variant ${item.variantId} not found`);

        const stock = await tx.stockLedger.aggregate({
          where: { variantId: item.variantId },
          _sum: { quantityChange: true },
        });
        const currentStock = stock._sum.quantityChange || 0;

        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${variant.sku}. Available: ${currentStock}`);
        }

        const unitPrice = Number(variant.price);
        let discountRate = 0;

        if (member) {
          // Priority: Variant Discount > Category Discount
          discountRate = Number(variant.memberDiscountRate || variant.product.category?.memberDiscountRate || 0);
        }

        const discountPerItem = (unitPrice * discountRate) / 100;
        const itemSubtotal = (unitPrice - discountPerItem) * item.quantity;

        totalSubtotal += unitPrice * item.quantity;
        totalDiscount += discountPerItem * item.quantity;

        orderItemsData.push({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: unitPrice,
          discountApplied: discountPerItem * item.quantity,
          subtotal: itemSubtotal,
        });

        // Prepare stock deduction
        stockLedgerData.push({
          variantId: item.variantId,
          quantityChange: -item.quantity,
          reason: 'SALE',
          userId: req.user.id,
        });
      }

      const totalAmount = totalSubtotal - totalDiscount;

      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          cashierId: req.user.id,
          memberId: value.memberId,
          status: 'PREPARING', // Direct pay assumed
          paymentMethod: value.paymentMethod,
          subtotal: totalSubtotal,
          discountAmount: totalDiscount,
          totalAmount: totalAmount,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          cashier: { select: { username: true } },
          member: { select: { name: true } },
          items: { include: { variant: { include: { product: true } } } },
        },
      });

      // 2. Update Stock Ledger
      await tx.stockLedger.createMany({
        data: stockLedgerData,
      });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Failed to create order' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        cashier: { select: { username: true } },
        member: { select: { name: true } },
        items: { include: { variant: { include: { product: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        cashier: { select: { username: true } },
        member: { select: { name: true } },
        items: { include: { variant: { include: { product: true } } } },
      },
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['PREPARING', 'COMPLETED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        throw new Error('Order not found');
      }

      if (existing.status !== 'CANCELLED' && status === 'CANCELLED') {
        await tx.stockLedger.createMany({
          data: existing.items.map((item) => ({
            variantId: item.variantId,
            quantityChange: item.quantity,
            reason: 'RETURN',
            userId: req.user.id,
          })),
        });
      }

      return tx.order.update({
        where: { id },
        data: { status },
      });
    });

    res.status(200).json(order);
  } catch (err) {
    if (err.message === 'Order not found') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
