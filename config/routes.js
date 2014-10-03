module.exports = function(app) {
    var versionApi = require('../app/controllers/versionApi');

    app.post('/version', versionApi.registerDeployment());
    app.get('/version', versionApi.getVersionByNameAndEnv());
}