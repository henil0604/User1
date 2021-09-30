const Joi = require("joi");


const Register = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    password: Joi.string()
        .min(4),

    email: Joi.string()
        .email()
        .required(),

    createdBy: Joi.string()
        .required(),

    method: Joi.string()
        .required(),

    authId: Joi.string(),

    avatarId: Joi.string()
        .required(),
})



module.exports = Register