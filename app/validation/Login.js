const Joi = require("joi");


const Login = Joi.object({

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(4),

    method: Joi.string()
        .required(),

    authId: Joi.string(),
})



module.exports = Login