module.exports = function(app) {
    var versionApi = require('../controllers/versionApi');

    app.post('/version', versionApi.registerEvent()); //deprecated
    app.get('/version', versionApi.getVersion()); //deprecated
    app.post('/api/v1/deploylog', versionApi.registerEvent());
    app.get('/api/v1/deploylog', versionApi.deployLog());
}