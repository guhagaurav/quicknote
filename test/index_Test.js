let assert = require('assert');
var sinon = require('sinon');
var chai = require('chai');
var should = require('should');
var request = require('request');
var expect = chai.expect;
var PassThrough = require('stream').PassThrough;
var index = require('../index.js');
var http = require('http');;
var mongoose = require('mongoose');
require('sinon-mongoose');
const base = 'http://localhost:3000';

//Importing our todo model for our unit testing.
var models = require("../UserSchema");

describe("To test mongoose schema for all models", function(){
    // Test will pass if we get all todos
   it("To validate the 'registerClient' model schema", function(done){
    var registerClient = new models.RegisterSchemaClient({
      })
      registerClient.validate(function (err){
        expect(err.errors.emailClient).to.exist;
        expect(err.errors.passClient).to.exist;
        expect(err.errors.fNameClient).to.exist;
        expect(err.errors.lNameClient).to.exist;
        expect(err.errors.secQuesClient).to.exist;
        expect(err.errors.gender).to.exist;
        expect(err.errors.secAnsClient).to.exist;  
        done();
      })
   });

   it("To validate the 'registerEmp' model schema", function(done){
    var registerEmp = new models.RegisterSchemaEmp({
      })
      registerEmp.validate(function (err){
        expect(err.errors.emailEmp).to.exist;
        expect(err.errors.passEmp).to.exist;
        expect(err.errors.fNameEmp).to.exist;
        expect(err.errors.lNameEmp).to.exist;
        expect(err.errors.secQuesEmp).to.exist;
        expect(err.errors.gender).to.exist;
        expect(err.errors.secAnsEmp).to.exist;  
        done();
      })
   });

   it("To validate the 'UserSchema' model schema", function(done){
    var userSchema = new models.UserSchema({
      })
      userSchema.validate(function (err){
        expect(err.errors.loginEmail).to.exist;
        expect(err.errors.loginPassword).to.exist;
        done();
      })
   });

})

describe('To test http methods for QuickNote', function(){

    beforeEach(() => {
        this.get = sinon.stub(request, 'get');
      });
      
      afterEach(() => {
        request.get.restore();
        request.post.restore();
    
      });

    it('to test /POST method', function(done) {
        var post = sinon.stub(request, 'post');
        const options = {
            method: 'post',
            body: {
                subject : "testing mocha unit tests",
                author : "Gaurav Guha",
                message : "Testing Notes POST method",
                noteLength: "10",
                noteTime: "11/25/2018, 8:29:48 PM"
            },
            json: true,
            url: `${base}/api/notes`,
            res:200
          };
          const obj = options;
          post.yields("success", JSON.stringify(obj.body) );
          request.post(options, (err, res, body) => {
              expect(JSON.parse(res).author).to.exist;
            done();
          });
    });

    it('to test /GET method, should respond with JSON array', function(done) {
      // need help here
      request(app)
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Array);
          done();
        });
    });

    it('should respond with redirect on post', function(done) {
      // need help here
      request(app)
          .post('/api/notes')
          //This will be one of the id value
          .send({"participant":{"nuid":"98ASDF988SDF89SDF89989SDF9898"}})
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) done(err);
            res.body.should.have.property('participant');
            res.body.participant.should.have.property('nuid', '98ASDF988SDF89SDF89989SDF9898');

             });
          done();
    });

  it('to test /GET method', function(done) {
        var post = sinon.stub(request, 'post');
        const options = {
            method: 'get',
            body: {
                subject : "testing mocha unit tests",
                author : "Poonam Singh",
                message : "Testing Notes GET method",
                noteLength: "10",
                noteTime: "11/25/2018, 8:29:48 PM"
            },
            json: true,
            url: `${base}/api/notes`,
            res:200
          };
          const obj = options;
          post.yields("success", JSON.stringify(obj.body) );
          request.get(options, (err, res, body) => {
              expect(JSON.parse(res).author).to.exist;
            done();
          });
    });

})
