var Joi = require('@hapi/joi');

module.exports = {
    options: {flatten: true},
    query: {
        base: Joi.string().lowercase().required(),
        comparewith: Joi.string().lowercase().required()
    }

};