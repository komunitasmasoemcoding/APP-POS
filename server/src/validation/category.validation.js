import Joi from 'joi';

export const validateCategory = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    memberDiscountRate: Joi.number().min(0).max(100).allow(null),
  });

  return schema.validate(data);
};
