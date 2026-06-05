import Joi from 'joi';

const itemSchema = Joi.object({
  variantId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().positive().required(),
});

export const validateOrder = (data) => {
  const schema = Joi.object({
    memberId: Joi.string().uuid().allow(null),
    paymentMethod: Joi.string().valid('CASH', 'CARD', 'EWALLET').required(),
    items: Joi.array().items(itemSchema).min(1).required(),
  });

  return schema.validate(data);
};
