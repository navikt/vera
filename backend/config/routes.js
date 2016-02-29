module.exports = function(app) {
    var validate = require('express-validation');
    var versionApi = require('../controllers/versionApi');
    var diffService = require('../controllers/diffService');
    var selftestService = require('../controllers/selftestService')
    var diffServiceValidation = require('../validations/diffServiceValidation')

    app.get('/isalive', versionApi.isAlive);
    app.get('/selftest', selftestService.testmyself)
    app.post('/version', versionApi.registerEvent); //deprecated
    //app.get('/version', versionApi.getVersion); //deprecated
    app.post('/api/v1/deploylog', versionApi.registerEvent);
    app.get('/api/v1/deploylog', versionApi.deployLog);
    app.get('/api/v1/config', versionApi.config);
    app.get('/api/v1/diff', validate(diffServiceValidation), diffService.diffEnvironments)
}