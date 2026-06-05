import { verifyAccessToken } from '../utils/jwt.js';
import prisma from '../utils/prisma.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (decoded instanceof Error) {
    console.error('Auth Middleware: Invalid Token:', decoded.message);
    return res.status(401).json({ message: `Unauthorized: ${decoded.message}` });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // Flatten permissions for easy access
    const permissions = user.role.permissions.map((rp) => rp.permission.name);
    
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role.name,
      permissions: permissions,
    };

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
