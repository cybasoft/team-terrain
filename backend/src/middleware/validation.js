const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
  action: Joi.string().valid('login').optional()
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  coordinates: Joi.string().optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  country: Joi.string().max(100).optional()
});

const locationUpdateSchema = Joi.object({
  coordinates: Joi.string().required(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  country: Joi.string().max(100).optional(),
  user_id: Joi.string().optional(),
  userId: Joi.string().optional(),
  // Temporarily allow name field to prevent validation errors (but don't process it)
  name: Joi.string().optional()
}).options({ stripUnknown: true });

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.details[0].message
      });
    }
    next();
  };
};

module.exports = {
  validate,
  loginSchema,
  registerSchema,
  updateUserSchema,
  locationUpdateSchema
};
