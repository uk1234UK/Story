//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption"); // Package for encryption purpose
const autoIncrement = require('mongoose-auto-increment');
const app = express();

const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


// const bcrypt = require("bcryptjs");
// const saltRounds = 10;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser:true});
//mongoose.set("useCreateIndex", true);  
autoIncrement.initialize(mongoose.connection);
// from simple js object to object created from mongoose schema class
const userSchema = new mongoose.Schema({     
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);

//Level 3 Bcrypt
//securepassword("thapa@123");
// const securePassword = async (password) =>{
//     const passwordHash = await bcrypt.hash(password, 10);
//     console.log(passwordHash);

//     const passwordmatch = await bcrypt.compare(password, passwordHash);
//     console.log(passwordmatch);
// }

// securePassword("thapa@123");

////Level - 2
//Plugins are a tool for reusing logic in multiple schemas
//By using encrypted fields, we able to encrypt specific schemas on which it is applied
const secret = "Thisisourlittlesecret.";
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

// userSchema.plugin(autoIncrement.plugin, "User");   //For giving userid to users 

const User = new mongoose.model("User", userSchema); 

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/secrets", function(req, res){
    if (req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
})

// //Level 3 Bcrypt
// app.post("/register", function(req, res){
//     bcrypt.hash(req.body.password, saltRounds, function(err, hash){
//         const newUser =  new User({
//             email: req.body.username,
//             password: hash
    
//         });
//         newUser.save(function(err){
//             if(err) {
//                 console.log(err);
//             }else {
//                 res.render("secrets");
//             }
//         });

//     });


//Level 4:session and cookies
app.post("/register", function(req, res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });

    });

     app.post("/login", function( req, res){

        const user= new User({
            username: req.body.username,
            password: req.body.password
        });
        
         req.login(user, function(err){
             if (err) {
                 console.log(err);

             } else {
                 passport.authenticate("local")(req , res, function(){
                     res.redirect("/secrets")
                 });

             }    
              })
     })  
      
    // const newUser =  new User({
    //     email: req.body.username,
    //     password: req.body.password

    // });
    // newUser.save(function(err){
    //     if(err) {
    //         console.log(err);
    //     }else {
    //         res.render("secrets");
    //     }
    // });

    // app.post("/login", function(req, res){
    //     const username = req.body.username;
    //     const password = req.body.password;

        // User.findOne({email:username}, function(err, foundUser){
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         if (foundUser) {
        //             bcrypt.compare(password, foundUser.password, function(err, result) {
                        
        //                if(result === true) {
        //                 res.render("secrets");
        //                }
        //             });
        //         }
        //     }
        //   });

        // });
//});



app.listen(3000, function() {
    console.log("Serevr started on port 3000.")
});