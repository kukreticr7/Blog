const { compile } = require("ejs");

var bodyParser = require("body-parser"),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
mongoose       = require("mongoose"),    
express        = require("express"),
app            = express();

mongoose.connect("mongodb://localhost/blog_app",{useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
mongoose.set('useFindAndModify', false);
app.use(expressSanitizer());

var blogSchema = new mongoose.Schema({
    title : String,
    image : String,
    body  : String,
    created  : {type : Date , default : Date.now }
});

var blog = mongoose.model("blog" ,blogSchema);

// blog.create({
//     title : "Test Blog",
//     image : "https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&h=350",
//     body : "The first test blog body "
// });

app.get("/",function(req,res){
    res.redirect("/blogs");
});

app.get("/blogs",function(req,res){
    blog.find({},function(err,blogs){
        if(err){
         console.log(err);
        }else{
            res.render("index", {blogs : blogs});
        }
    });
   
});

app.post("/blogs",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
   blog.create(req.body.blog,function(err,newBlog){
        if(err)
        {
            res.render("new");
        }else {
            res.redirect("/blogs");
        }
   });
});

app.get("/blogs/new", function(req,res){
   res.render("new")
});


app.get("/blogs/:id",function(req,res){
   
    blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
           res.render("show",{blogs : foundBlog});
        }
    });
    
});

app.get("/blogs/:id/edit",function(req,res){
    blog.findById(req.params.id,function(err,foundBlog){
        if(err){
          res.redirect("/blogs");
        }else{
          res.render("edit",{blogs:foundBlog});
        }
    })
   
});

app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
    if(err){
      res.redirect("/blogs");
    }else{
      res.redirect("/blogs/" + updatedBlog._id);
    }
    });
});

app.delete("/blogs/:id",function(req,res){
   blog.findByIdAndRemove(req.params.id,function(err){
     if(err){
      res.redirect("/blogs");
     }else{
        res.redirect("/blogs");
     }
   });
});

app.listen(3000 , function(){
  console.log("Server started");
});
