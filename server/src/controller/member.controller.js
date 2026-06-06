import prisma from '../utils/prisma.js';
import { validateMember } from '../validation/member.validation.js';

export const createMember = async (req, res) => {
  const { error, value } = validateMember(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const member = await prisma.member.create({
      data: value,
    });
    res.status(201).json(member);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Email, Phone or Barcode already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMemberById = async (req, res) => {
  const { id } = req.params;
  try {
    const member = await prisma.member.findUnique({
      where: { id },
    });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.status(200).json(member);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMemberByBarcode = async (req, res) => {
  const { code } = req.params;
  try {
    const member = await prisma.member.findUnique({
      where: { barcode: code },
    });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.status(200).json(member);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMember = async (req, res) => {
  const { id } = req.params;
  const { error, value } = validateMember(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const member = await prisma.member.update({
      where: { id },
      data: value,
    });
    res.status(200).json(member);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteMember = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.member.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
