var app=require('express')(),
    mongoose=require('mongoose');

var commentSchema=new mongoose.Schema({
    user:String,
    comment:String,
    date:{
        type:Date
    }
});

module.exports=mongoose.model("Comment",commentSchema);