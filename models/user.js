var app                   = require('express')(),
    mongoose              = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

var userSchema=new mongoose.Schema({
    username: String,
    name: String,
    department: String,
    year: String
});
userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);