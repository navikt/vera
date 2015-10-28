module.exports = function(app) {
    var validate = require('express-validation');
    var versionApi = require('../controllers/versionApi');
    var diffService = require('../controllers/diffService');
    var diffServiceValidation = require('../validations/diffServiceValidation')

    app.post('/version', versionApi.registerEvent); //deprecated
    //app.get('/version', versionApi.getVersion); //deprecated
    app.post('/api/v1/deploylog', versionApi.registerEvent);
    app.get('/api/v1/deploylog', versionApi.deployLog);
    app.get('/api/v1/config', versionApi.config);
    app.get('/api/v1/diff', validate(diffServiceValidation), diffService.diffEnvironments)
}