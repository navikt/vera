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

    //it('bad input', function should(t) {
    //    var req = {}
    //    t.throws(diffService.diffEnvironments(req, res), function(a,b,c) {
    //        console.log("her", a, b, c);});
    //
    //
    //
    //    //console.log(res.statusCode);
    //    //console.log(res.body);
    //})

    it('happy path', function should(t) {
        var req = {}
        req.query= {base: 'base', comparee: 'e1,e2'}
        diffService.diffEnvironments(req, res);

        var responseBody = res.body;

        console.log(res.body);

        t.equal(res.statusCode, 200, 'calling diff service with valid arguments gives 200 ok');
        t.equal(responseBody.length, 3, 'returned list contains 3 applications')

        t.end();
    })
})
