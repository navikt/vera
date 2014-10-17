var assert = require('assert');
var request = require('supertest'); // "request" is a simplified HTTP client
var express = require('express');
var expect = require('chai').expect;
var app = express();
var chai = require('chai');
chai.use(require('chai-fuzzy'));

var url = "http://localhost:9080";

describe('JsonBodyValidation', function () {
    it('return object must contain the required fields', function (done) {
        request(url).get('/version?application=pensjon-fss&environment=t5')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
            if (err) { 
                console.log("Something went wrong when calling Vera");
                throw err;
            }
            else { 
                //console.log(res.body); // Response from the API 
                expect(res.body[0]).to.have.property('application');
                expect(res.body[0]).to.have.property('environment');
                expect(res.body[0]).to.have.property('version');
                done();    
            }

        }

        )
    })
});

describe('Vera GET', function() {
    it('must return one item when app and env is provided', function(done) {
        request(url).get('/version?application=pensjon-fss&environment=t5')
        .expect(200)
        .end(function(err, res) {
            if (err) { 
                console.log("ERROR");
                throw err;
            }
            else {
                expect(res.body[0].application).to.equal('pensjon-fss');
                expect(res.body[0].environment).to.equal('T5');
                expect(res.body.version).not.to.be.null;
                
                done();  
            }
 
        } 
        )})
    it('must return multiple applications when querying a specific environment', function(done) {
        request(url).get('/version?environment=t5')
        .expect(200)
        .end(function(err, res) {
            if (err) { 
                console.log("ERROR");
                throw err;
            }
            else {

                expect(res.body).to.have.length.above(2);

                /* Verify some random data */
                //expect(res.body).to.deep.include.members([ { application: "sapo", environment: "t5", version: "-" } ]);
                //expect(res.body).to.deep.include.members([ { application: "pensjon-fss", environment: "t5", version: "-" } ]);
                done();  
            }

        }
        )})
    it('must return multiple environments when querying a specific application', function(done) {
        request(url).get('/version?application=pensjon-fss')
        .expect(200)
        .end(function(err, res) {
            if (err) { 
                console.log("ERROR");
                throw err;
            }
            else {
                //console.log(res.body);
                expect(res.body).to.have.length.above(2);

                /* Verify some random data */
                //expect(res.body).to.deep.include.members([ { application: "pensjon-fss", environment: "q4", version: "8.1.28" } ]);

                done();  
            }

        }
        )})

    it('must support wildcard application filter', function(done) {
        request(url).get('/version?application=pensjon*&environment=t6')
        .expect(200)
        .end(function(err, res) {
            if (err) { 
                console.log("ERROR");
                throw err;
            }
            else {
                expect(res.body).to.have.length(2);
        
                /* Verify some random data */
                expect(res.body[0].application).to.contain('pensjon');
                expect(res.body[0].environment).to.equal('T6');
                
                done();  
            }

        }
        )})

    it('emtpy filter must return all applications in all environments', function(done) {
        request(url).get('/version')
        .expect(200)
        .end(function(err, res) {
            if (err) { 
                console.log("ERROR");
                throw err;
            }
            else {
                //console.log(res.body);
                expect(res.body).to.have.length.above(2);

                /* Verify some random data */
                //expect(res.body).to.deep.include.members([ { application: "pensjon-fss", environment: "q4", version: "8.1.28" } ]);

                done();  
            }

        }
        )})

        it('non-existing applications should return empty list', function(done) {
        request(url).get('/version?application=doesnotexist')
        .expect(200)
        .end(function(err, res) {
            if (err) { 
                console.log("ERROR");
                throw err;
            }
            else {
                console.log(res.body);
                expect(res.body).to.have.length(1);

                /* Verify some random data */
                expect(res.body[0].application).to.contain('');
                expect(res.body[0].environment).to.equal('');
                expect(res.body[0].environment).to.equal('');

                done();  
            }

        }
        )})

        it('non-existing environment should return empty list', function(done) {
        request(url).get('/version?application=pensjon-fss&environment=E1')
        .expect(200)
        .end(function(err, res) {
            if (err) { 
                console.log("ERROR");
                throw err;
            }
            else {
                console.log(res.body);
                expect(res.body).to.have.length(1);

                /* Verify some random data */
                expect(res.body[0].application).to.contain('');
                expect(res.body[0].environment).to.equal('');
                expect(res.body[0].environment).to.equal('');

                done();  
            }

        }
        )})


});



//});

/*describe('Test1', function() {
    it('tester noe', function(done) {
        request(app)
        //.get('http://localhost:9080/version')
        .get('version')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)       
        .end(function (err, res) {
            done();
        })
        
    })}

    );


describe('Kenneth', function() {
    it('tekst her', function(done) {
        request(app)
        //.get('http://localhost:9080/version?application=pensjon-fss&environment=t5')
        .get('/version?application=pensjon-fss&environment=t5')
        .expect("hei")
        .end(function (err, res) {
            if (err) {
                console.log("ERROR in test");
                console.log(err);
                //res.send("aaa");
                done(err);
            }
            else { 
                console.log("Success!");
                done(); 
            }
        })
    }
    )

});
*/
/*describe('GET', function(){
    it('respond with json', function(done){
      request(app)
      .get('/version')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
    })
  })
*/
