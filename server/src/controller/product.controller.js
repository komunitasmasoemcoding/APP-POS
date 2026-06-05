import prisma from '../utils/prisma.js';
import { validateProduct } from '../validation/product.validation.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, categoryId, variants } = req.body;
    
    // Parse variants if they come as a string (from FormData)
    let parsedVariants = variants;
    if (typeof variants === 'string') {
      try {
        parsedVariants = JSON.parse(variants);
      } catch {
        return res.status(400).json({ message: 'Invalid variants format' });
      }
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const imageUrl = `/public/uploads/${req.file.filename}`;

    const { error, value } = validateProduct({
      name,
      description,
      categoryId,
      image: imageUrl,
      variants: parsedVariants,
    });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name: value.name,
          description: value.description,
          image: value.image,
          categoryId: value.categoryId,
          variants: {
            create: value.variants,
          },
        },
        include: {
          variants: true,
        },
      });
      return newProduct;
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'SKU or Barcode already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const [products, stockSums] = await Promise.all([
      prisma.product.findMany({
        where: { deletedAt: null },
        include: {
          category: true,
          variants: true,
        },
      }),
      prisma.stockLedger.groupBy({
        by: ['variantId'],
        _sum: {
          quantityChange: true,
        },
      }),
    ]);

    const stockMap = stockSums.reduce((acc, curr) => {
      acc[curr.variantId] = curr._sum.quantityChange || 0;
      return acc;
    }, {});

    const productsWithStock = products.map((product) => ({
      ...product,
      variants: product.variants.map((variant) => ({
        ...variant,
        currentStock: stockMap[variant.id] || 0,
      })),
    }));

    res.status(200).json(productsWithStock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
      },
    });

    if (!product || product.deletedAt) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const stockSums = await prisma.stockLedger.groupBy({
      where: {
        variantId: {
          in: product.variants.map((v) => v.id),
        },
      },
      by: ['variantId'],
      _sum: {
        quantityChange: true,
      },
    });

    const stockMap = stockSums.reduce((acc, curr) => {
      acc[curr.variantId] = curr._sum.quantityChange || 0;
      return acc;
    }, {});

    const variantsWithStock = product.variants.map((variant) => ({
      ...variant,
      currentStock: stockMap[variant.id] || 0,
    }));

    res.status(200).json({ ...product, variants: variantsWithStock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getVariantByBarcode = async (req, res) => {
  const { code } = req.params;
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { barcode: code },
      include: {
        product: {
          include: { category: true }
        }
      },
    });

    if (!variant || variant.product.deletedAt) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    const stock = await prisma.stockLedger.aggregate({
      where: { variantId: variant.id },
      _sum: { quantityChange: true },
    });

    res.status(200).json({
      ...variant,
      currentStock: stock._sum.quantityChange || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const { name, description, categoryId, variants } = req.body;
    
    let parsedVariants = variants;
    if (typeof variants === 'string') {
      parsedVariants = JSON.parse(variants);
    }

    const data = {
      name,
      description,
      categoryId,
    };

    if (req.file) {
      data.image = `/public/uploads/${req.file.filename}`;
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await prisma.$transaction(async (tx) => {
      // 1. Update Product info
      const updatedProduct = await tx.product.update({
        where: { id },
        data,
      });

      if (parsedVariants && Array.isArray(parsedVariants)) {
        // 2. Handle Variants: Upsert (update existing or create new)
        for (const v of parsedVariants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                sku: v.sku,
                barcode: v.barcode,
                price: v.price,
                size: v.size,
                temperature: v.temperature,
                memberDiscountRate: v.memberDiscountRate,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                sku: v.sku,
                barcode: v.barcode,
                price: v.price,
                size: v.size,
                temperature: v.temperature,
                memberDiscountRate: v.memberDiscountRate,
              },
            });
          }
        }

        // 3. Optional: Delete variants not in the list? 
        // For safety in POS, we usually don't delete if there are transactions.
      }

      return updatedProduct;
    });

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
