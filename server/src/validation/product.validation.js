import Joi from 'joi';

const variantSchema = Joi.object({
  sku: Joi.string().required(),
  barcode: Joi.string().allow(null, ''),
  price: Joi.number().precision(2).positive().required(),
  size: Joi.string().valid('SMALL', 'MEDIUM', 'LARGE').allow(null),
  temperature: Joi.string().valid('HOT', 'ICED').allow(null),
  memberDiscountRate: Joi.number().min(0).max(100).allow(null),
});

export const validateProduct = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().allow(null, ''),
    image: Joi.string().required(), // Local path /public/uploads/...
    categoryId: Joi.string().uuid().allow(null),
    variants: Joi.array().items(variantSchema).min(1).required(),
  });

  return schema.validate(data);
};
