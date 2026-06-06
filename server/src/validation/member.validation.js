import Joi from 'joi';

export const validateMember = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().allow(null, ''),
    phone: Joi.string().min(10).max(15).allow(null, ''),
    barcode: Joi.string().allow(null, ''),
  });

  return schema.validate(data);
};
