var express                 = require('express'),
        app                 = express();
    mongoose                = require('mongoose'),
    bodyParser              = require('body-parser'),
    passport                = require('passport'),
    localStrategy           = require('passport-local'),
    passportLocalMongoose   = require('passport-local-mongoose'),
    Comment                 = require('./models/comment'),
    Post                    = require('./models/post'),
    User                    = require('./models/user'),
    methodOverride          = require('method-override');

app.set('view engine','ejs');
app.use(express.static(__dirname+'/assets'));
app.use(bodyParser.urlencoded({extended:true}));
app.locals.moment = require('moment');

//Passport Config
app.use(require('express-session')({
    secret:"Code Arcade",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
});
app.use(methodOverride('_method'));

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// mongoose.connect("mongodb://localhost:27017/codeArcadeDB",{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.connect("mongodb+srv://arpan:03432567760@memer-destination-db.r79sj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology:true});

// Root Route
app.get('/',function(req,res){
    res.render('landing');
});

//Forum Routes
app.get("/forum/page/:id",function(req,res){//Change the links
    Post.find({},function(err,postList){
        if(err){
            console.log(err);
        }
        else{
            res.render("forum/forum",{listOfPosts:postList,pgno:req.params.id}); 
        }
    });
});

//In order to make a forum post the user must be logged In , so use the appropriate middleware

app.get("/forum/new",loggedIn,function(req,res){
    res.render("forum/post");
});

// Posting a new Post

app.post("/forum",loggedIn,function(req,res){
    //console.log(req.body.forum);
    var newPost=new Post({
        author:req.user.name,
        title:req.body.title,
        post:req.body.data,
        answers:0,
        date:Date.now()
    });
    newPost.user.push(req.user);
    newPost.save(function(err,post){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.redirect('/forum/page/1');
        }
    });
});

// Seeing a specific Post with id --> id

app.get("/forum/:id",function(req,res){
    Post.findById(req.params.id).populate('user').populate('comments').exec(function(err,post){
        if(err){
            console.log(err);
        }
        else{
            res.render("forum/show",{post:post});
        }
    });
});

app.get("/forum/:id/edit",edit,function(req,res){
    Post.findById(req.params.id,function(err,post){
        if(err){
            res.redirect('back');
        }
        else{
            res.render('forum/edit',{post:post});
        }
    });
});

app.put("/forum/:id",edit,function(req,res){
    Post.findByIdAndUpdate(req.params.id,req.body.edit,function(err,post){
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/forum/'+req.params.id);
        }
    });
});

app.delete("/forum/:id",function(req,res){
    Post.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err)
        }
        res.redirect('/forum/page/1');
    });
})

/*app.get("/secret",loggedIn,function(req,res){
    res.render('authentication/secret.ejs');
});*/

//Comment Routes
app.post('/forum/:id/comments/new',loggedIn,function(req,res){
    var newComment=new Comment({
        user:req.user.username,
        comment:req.body.data,
        date:Date.now()
    });
    newComment.save(function(err,comment){
        if(err)
        {
            console.log(err);
        }
        else{
            Post.findById(req.params.id,function(err,post){
                if(err){
                    console.log(err);
                }
                else{
                    post.comments.push(comment);
                    post.save();
                }
                res.redirect('/forum/'+req.params.id);
            });
        }
    });

});

//Auth Routes
//Register:
app.get('/register',function(req,res){
    res.render('authentication/register');
});

app.post('/register',function(req,res){
    User.register(new User({
        username:req.body.username,
        name:req.body.name,
        department:req.body.department,
        year:req.body.year
    }),req.body.password,function(err,usr){
        if(err){
            console.log(err);
            return res.render('authentication/register');
        }
        passport.authenticate('local')(req,res,function(){
            res.redirect('/forum/page/1');
        });
    });
});
//Login:
app.get('/signin',function(req,res){
    res.render('authentication/login');
});

app.post('/signin',passport.authenticate('local',{
    successRedirect:"/forum/page/1",
    faliureRedirect:"/signin"
}),function(req,res){});

//Log-Out:
app.get('/signout',function(req,res){
    req.logout();
    res.redirect('/');
});

//Middle-Ware
function loggedIn(req,res,next){
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect("/signin");
}

function edit(req,res,next)
{
    if(req.isAuthenticated())
    {
        Post.findById(req.params.id).populate('users').exec(function(err,post){
            if(err)
            {
                console.log(err);
            }
            else{
    
                if(req.user._id.equals(post.user[0]._id)){
                    return next();
                }
                res.redirect('/forum/page/1');
            }
        });
    }
    else
        res.redirect('/signin');
}

app.listen(3000,function(){
    console.log('Server Started');
});