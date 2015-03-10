module.exports = function(app) {
    var versionApi = require('../controllers/versionApi');

    app.post('/version', versionApi.registerDeployment()); //deprecated
    app.get('/version', versionApi.getVersion()); //deprecated
    app.post('/api/v1/deploylog', versionApi.registerDeployment());
    app.get('/api/v1/deploylog', versionApi.deployLog());
    app.get('/api/v1/config', versionApi.config())
}