const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 8081;
const parseJson = require("parse-json");
const bodyParser = require("body-parser");
var MongoClient = require("mongodb").MongoClient;
var mongoose = require("mongoose");
var ObjectID = require("mongodb").ObjectID;
var models = require("./UserSchema");
var exports = (module.exports = {});
var session = require('express-session');
var validator = require('express-validator');
var MongoDBStore = require('connect-mongodb-session')(session);
require("request");
mongoose.connect("mongodb://admin:admin123@ds227664.mlab.com:27664/quicknote/login",{
});
var store = new MongoDBStore({
  uri: 'mongodb://admin:admin123@ds227664.mlab.com:27664/quicknote/login',
  collection: 'mySessions'
});
var db = mongoose.connection;
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());
app.use(express.static(path.join(__dirname, "/")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

store.on('error', function(error) {
  assert.ifError(error);
  assert.ok(false);
});

app.use(require('express-session')({
  secret: 'secret-gogo',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  resave: true,
  saveUninitialized: true
}));

const targetBaseUrl = 'http://localhost:3000'
var Nexmo = require("nexmo");
const nexmo = new Nexmo({
  apiKey: "b7a1eeb7",
  apiSecret: "xwNgmsR2H5vzDNwe"
});

function authenticateLogin(authBody){
  let tempAuthBody = authBody;
  return models.RegisterSchemaClient.findOne({emailClient: tempAuthBody.loginEmail},'passClient').then ((data)=>{
      if(data == null || data.length === 0 || data == undefined) {
        tempAuthBody.authStatus = false; 
      }
      else if (data.length != 0 && data.passClient == tempAuthBody.loginPassword){
        tempAuthBody.clientId = data._id;
        tempAuthBody.authStatus = true;
      }
      tempAuthBody  = authBody;
      return tempAuthBody;
  })
}


db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
  console.log("Connection succeeded to Mongodb using Mongoose");

  app.post('/api/login/', function(req, res) {
    req.check('loginEmail', 'Invalid Email! ').isEmail();
    req.check('loginPassword', 'Invalid Password!  ').isLength({min:4});
    let errors = req.validationErrors();
    let loginErrors = JSON.parse(JSON.stringify(errors));
    if(errors){
      req.session.errors = loginErrors;
      req.session.success = false;
      res.send(req.session.errors)
  
    }
    else{
      let authBody = {};
      req.session.success = true;
      authBody.loginEmail = req.body.loginEmail;
      authBody.loginPassword = req.body.loginPassword;
      authenticateLogin(authBody).then((authBody)=>{
      if(authBody.authStatus){
        req.session.user = authBody;
        res.render("index", {
          title: "Login to Personal Notes"
        });
      }
      else{
        res.send("404");
      }
     }).catch((err)=>{
        throw err;
     })
    }
  });

app.post('/api/registerUser', function(req, res) { 
    req.checkBody('fNameClient','FirstName is empty! ').notEmpty();
    req.checkBody('lNameClient','LastName is empty! ').notEmpty();
    req.checkBody('emailClient','Email is empty! ').notEmpty();
    req.checkBody('passClient','Password is empty! ').notEmpty();
    req.checkBody('secQuesClient','Security ques is empty! ').notEmpty();
    req.checkBody('secAnsClient','Security ans is empty! ').notEmpty();
    req.check('emailClient', 'Invalid Email!  ').isEmail();
    req.check('passClient', 'Min Password length is 4!  ').isLength({min:4})
    req.check('passClient', 'Password do not match!  ').equals(req.body.confirmPassClient);
    let errors = req.validationErrors();
    let registrationError = JSON.parse(JSON.stringify(errors));
    if(registrationError){
      console.log(" registrationError!!!!!!!!! ", registrationError)
      req.session.errors = registrationError;
      req.session.success = false;
      res.send(req.session.success)
  
    }
    else{
      console.log("req.body",req.body)
    var registerClient = new models.RegisterSchemaClient({
      emailClient : req.body.emailClient,
      passClient : req.body.passClient,
      fNameClient : req.body.fNameClient,
      lNameClient : req.body.lNameClient,
      phClient : req.body.phClient,
      gender : req.body.gender,
      secQuesClient : req.body.secQuesClient,
      secAnsClient : req.body.secAnsClient
    })

    registerClient.save(function (err, data){
      if (err){
        console.log("ERROERRRRRR!!!",err)
        res.send(err)
      }
      else{
        console.log("REGISTER SAVE!!!",data)
        req.session.success = true;
        res.send(req.session.success)
      }
    })
    }
  });
});

app.get("/api/registerUser", (req, res) => {
  res.render("registerUser", {
    title: "Register New User",
    success: req.session.success,
    errors: req.session.errors
  });
  req.session.errors = null;
})

app.get("/api/login/", (req, res) => {
    res.render("login", {
      title: "Login to Personal Notes",
      success: req.session.success,
      errors: req.session.errors
    });
    req.session.errors = null;
});

app.get("/api/logout", (req, res)=>{
  req.session.destroy();
  res.redirect("/api/login")
  return res.status(200).send();
})

app.post("/api/sms", (req, res) => {
    nexmo.message.sendSms(
        '16193917840', req.body.notePhone, req.body.message,
          (err, responseData) => {
            if (err) {
              console.log(err);
              res.status(500).send("internal Server Error");
            } else {
              res.send(responseData);
            }
          }
       );
});

MongoClient.connect("mongodb://localhost:27017/notes", function(err, client) {
    let db = client.db("notes");
    let notes = db.collection("notes");
    if (err) throw err;

    app.get("/notes/", (req, res) => {
      if (!req.session.user){
         res.redirect("/api/login")
      }
      else{
        res.render("index", {
          title: "Get all notes",
        });
        res.status(200);
      }
       
    });

    app.get("/api/notes/", (req, res) => {
     if(req.session.user){
      //let userDetails = JSON.parse(JSON.stringify(req.session.user));
       notes.find({"emailClient": req.session.user.loginEmail}).toArray((err, result) => {
         if (err) throw err;
         else {
           result === null
             ? res.status(404).send("Data not found")
             : res.status(200).send(result);
         }
       });

     }
    });

    app.post("/api/notes/search", (req, res) => {
      let body = req.body;
      if(req.session.user){
      notes.find({$and: [{"emailClient": req.session.user.loginEmail},{ message: { $regex: body.searchText }}]}).toArray((err, data) => {
          if (err) {
            console.log(err);
            res.status(500).send("Some internal error");
          } else {
            res.send(data);
          }
        });
      }
    });

    app.get("/api/notes/:id", (req, res) => {
      let id = ObjectID.createFromHexString(req.params.id);
      notes.findOne({ _id: id }, (err, note) => {
        if (err) {
          console.log(err);
          res.status(500).send("internal Server Error");
        } else {
          note === null
            ? res.status(404).send("Data not found")
            : res.send(note);
        }
      });
    });

    app.post("/api/notes", (req, res) => {
      let body = req.body
      if(req.session.user){
        let userDetails = JSON.parse(JSON.stringify(req.session.user));
        body.emailClient = userDetails.loginEmail;
        notes.insert(body, (err, result) => {
          if (err) { 
          console.log(err);
          res.status(500).send("Some internal error");
          } else {
          res.status(200).send(result);
        }
      });
    }
    });

    app.put("/api/notes/:id", (req, res) => {
      let id = ObjectID.createFromHexString(req.params.id);
      let subject = req.body.subject;
      let author = req.body.author;
      let message = req.body.message;
      let noteLength = req.body.noteLength;
      let noteTime = req.body.noteTime;
      let newvalues = {
        $set: {
          subject: `${subject}`,
          author: `${author}`,
          message: `${message}`,
          noteLength: `${noteLength}`,
          noteTime: `${noteTime}`
        }
      };
      notes.updateOne({ _id: id }, newvalues, (err, note) => {
        if (err) {
          console.log(err);
          res.status(500).send("internal Server Error");
        } else {
          note === null
            ? res.status(404).send("Data not found")
            : res.status(204).send(note);
        }
      });
    });

    app.delete("/api/notes/:id", (req, res) => {
      let id = ObjectID.createFromHexString(req.params.id);
      notes.removeOne({ _id: id }, (err, note) => {
        if (err) {
          console.log(err);
          res.status(500).send("internal Server Error");
        } else {
          note === null
            ? res.status(404).send("Data not found")
            : res.status(204).send(note);
        }
      });
    });
  }
);



var server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
