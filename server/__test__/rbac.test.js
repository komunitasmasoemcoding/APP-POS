import { checkPermission } from '../src/middlewares/rbac.js';

describe('RBAC Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  it('should return 401 if user is not on request', () => {
    const middleware = checkPermission('manage_products');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should allow ADMIN even without explicit permission', () => {
    req.user = { role: 'ADMIN', permissions: [] };
    const middleware = checkPermission('manage_products');
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should allow user with required permission', () => {
    req.user = { role: 'CASHIER', permissions: ['process_sales'] };
    const middleware = checkPermission('process_sales');
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if user lacks permission', () => {
    req.user = { role: 'CASHIER', permissions: ['process_sales'] };
    const middleware = checkPermission('manage_products');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
