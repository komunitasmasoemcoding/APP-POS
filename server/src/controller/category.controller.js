import prisma from '../utils/prisma.js';
import { validateCategory } from '../validation/category.validation.js';

export const createCategory = async (req, res) => {
  const { error, value } = validateCategory(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: value.name,
        memberDiscountRate: value.memberDiscountRate,
      },
    });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validateCategory(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: value.name,
        memberDiscountRate: value.memberDiscountRate,
      },
    });
    res.status(200).json(category);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
