'use strict'

var _ = require('lodash')
var proxyquire = require('proxyquire')
var scotchTape = require('scotch-tape')
var testdata = require('./testdata')
var mockFactory = require('moxpress')

var expressMock = mockFactory();

var EventStub = {};
var diffService;
var res;

var test = scotchTape({
    before: function beforeEach(t) {
        EventStub.getLatestDeployedApplicationsFor =
            function( predicate, callback) {
                return callback({}, testdata.mockResponse)
            }
        diffService = proxyquire('../backend/controllers/diffService', { '../models/event': EventStub });

        res = expressMock.res;

        t.end();
    }
});

test('diffService tests', function test(it) {

    it('happy path', function should(t) {
        var req = {}
        req.query= {base: 'base', comparewith: 'e1,e2'}
        diffService.diffEnvironments(req, res);

        var responseBody = res.body;
        var appOneBase = comparisonResultByApplicationAndEnvironment(responseBody, 'appone', 'base');
        var appOneEnv = comparisonResultByApplicationAndEnvironment(responseBody, 'appone', 'e1');
        var appOneNotDeployedToEnv = comparisonResultByApplicationAndEnvironment(responseBody, 'appone', 'e2')
        var appTwoEnv = comparisonResultByApplicationAndEnvironment(responseBody, 'apptwo', 'e1');
        var appNotDeployedToBase = filterByApp(responseBody, 'notdeployedtobase');

        t.equal(res.statusCode, 200, 'calling diff service with valid arguments gives 200 ok');
        t.equal(responseBody.length, 2, 'returned list contains all applications in base environment');
        t.equal(appOneBase.isBaseEnvironment, true, 'isBaseEnvironment property is set correctly for base environment');
        t.equal(appOneBase.diffToBase, 0, 'diff result is 0 for base environment');
        t.equal(appOneEnv.isBaseEnvironment, false, 'isBaseEnvironmentProperty is set correctly for other environments');
        t.equal(appOneEnv.diffToBase, 0, 'diff result is zero when version is equal to version in base environment');
        t.equal(appTwoEnv.diffToBase, 1, 'version is ahead of version in base environment');
        t.equal(appOneNotDeployedToEnv.diffToBase, undefined, 'no diff result available if application is not deployed to environment')
        t.equal(appNotDeployedToBase, undefined, 'application not deployed to base environment is not part of response')
        t.end();
    })
})

var filterByApp = function(json, app) {
    return _.chain(json).filter(function (elem) {
        return elem.application === app
    }).first().value();
}


var comparisonResultByApplicationAndEnvironment = function(json, app, env) {
    return _.chain(filterByApp(json, app).environments).filter(function (elem) {
        return elem.environment === env
    }).first().value();
}
