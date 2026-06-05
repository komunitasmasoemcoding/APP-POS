import { validateCategory } from '../src/validation/category.validation.js';

describe('Category Validation', () => {
  it('should validate a correct category', () => {
    const { error } = validateCategory({ name: 'Coffee' });
    expect(error).toBeUndefined();
  });

  it('should fail if name is too short', () => {
    const { error } = validateCategory({ name: 'Co' });
    expect(error).toBeDefined();
  });

  it('should fail if name is missing', () => {
    const { error } = validateCategory({});
    expect(error).toBeDefined();
  });
});
