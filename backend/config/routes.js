module.exports = function(app) {
    var versionApi = require('../controllers/versionApi');

    app.post('/version', versionApi.registerDeployment());
    app.get('/version', versionApi.getVersion());
    app.get('/cv', versionApi.getCurrentVersions());
}