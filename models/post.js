var mongoose=require('mongoose'),
    app     =require('express')();
var postSchema=new mongoose.Schema({
    author: String,
    title: String,
    post: String,
    date: {
        type:Date
    },
    answers:Number,
    user: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    comments: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }]
});

module.exports=mongoose.model("Post",postSchema);
