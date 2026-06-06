export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user session' });
    }

    const { permissions, role } = req.user;

    // Admin has all permissions automatically
    if (role === 'ADMIN') {
      return next();
    }

    if (permissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({
      message: `Forbidden: You do not have permission to ${requiredPermission}`,
    });
  };
};
