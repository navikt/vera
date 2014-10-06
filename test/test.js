var assert = require('assert');
var request = require('supertest'); // "request" is a simplified HTTP client
var express = require('express');
var expect = require('chai').expect;

var url = "http://localhost:9080";

describe('JsonBodyValidation', function () {
    it('all values should be present', function (done) {
        request(url).get('/version?application=pensjon-fss&environment=t5')
        .expect(200)
        .end(function(err, res) {
            if (err) { 
                console.log("Something went wrong when calling Vera");
                throw err;
            }
            else { 
                console.log(res.body); // Response from the API 

                expect(res.body).to.have.property('application');
                expect(res.body).to.have.property('environment');
                expect(res.body).to.have.property('version');
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

                console.log(res.body); // Response from the API
                console.log(res.body.length);
                //expect(res.body).to.have.property('version');
                express(res.body)
                done();
            }

        }
      )}   
)});
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
