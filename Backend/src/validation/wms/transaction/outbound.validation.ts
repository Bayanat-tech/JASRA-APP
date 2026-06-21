import Joi from "joi";

export const pickOrderSchema = (data: { serial_no: string[] }) => {
  const schema = Joi.object().keys({
    serial_no: Joi.array().items(Joi.string()).required(),
  });

  return schema.validate(data);
};
