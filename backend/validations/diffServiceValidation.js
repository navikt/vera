var Joi = require('joi');

/* module.exports = {
    options: {flatten: true},
    query: {
        base: Joi.string().lowercase().required(),
        comparewith: Joi.string().lowercase().required()
    }
}; */

module.exports = {
    query: Joi.object({
        base: Joi.string().lowercase().required(),
        comparewith: Joi.string().lowercase().required()
    })
};