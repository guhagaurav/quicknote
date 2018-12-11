
    'use strict';
    var mongoose = require('mongoose');
    var userSchema = new mongoose.Schema({
      loginEmail: { type: String, required: true, index: { unique: true } },
      loginPassword: { type: String, required: true },
    });
    
    var registerSchemaClient = new mongoose.Schema({
      emailClient: { type: String, required: true, index: { unique: true } },
      passClient: { type: String, required: true },
      fNameClient: { type: String, required: true },
      lNameClient: { type: String, required: true },
      gender: { type: String, required: true },
      phClient: { type: String, required: false },
      secQuesClient: { type: String, required: true },
      secAnsClient: { type: String, required: true }
    });

    var registerSchemaEmp = new mongoose.Schema({
      emailEmp: { type: String, required: true, index: { unique: true } },
      passEmp: { type: String, required: true },
      fNameEmp: { type: String, required: true },
      lNameEmp: { type: String, required: true },
      gender: { type: String, required: true },
      phEmp: { type: String, required: false },
      secQuesEmp: { type: String, required: true },
      secAnsEmp: { type: String, required: true }
    });
    
    var UserSchema = mongoose.model('UserSchema', userSchema);
    var RegisterSchemaClient = mongoose.model('RegisterSchemaClient', registerSchemaClient);
    var RegisterSchemaEmp = mongoose.model('RegisterSchemaEmp', registerSchemaEmp);

  module.exports = {
    UserSchema: UserSchema,
    RegisterSchemaClient: RegisterSchemaClient,
    RegisterSchemaEmp: RegisterSchemaEmp
};

