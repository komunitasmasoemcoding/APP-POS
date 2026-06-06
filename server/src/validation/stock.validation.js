import Joi from 'joi';

export const validateStockAdjustment = (data) => {
  const schema = Joi.object({
    variantId: Joi.string().uuid().required(),
    quantityChange: Joi.number().integer().not(0).required(),
    reason: Joi.string().valid('INITIAL', 'RESTOCK', 'SALE', 'SPOILAGE', 'RETURN').required(),
  });

  return schema.validate(data);
};
