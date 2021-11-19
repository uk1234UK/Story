//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
//const encrypt = require("mongoose-encryption"); // Package for encryption purpose

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser:true});

// from simple js object to object created from mongoose schema class
const userSchema = new mongoose.Schema({     
    email:String,
    password:String
});

// Plugins are a tool for reusing logic in multiple schemas
// By using encrypted fields, we able to encrypt specific schemas on which it is applied
// const secret = "Thisisourlittlesecret.";
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema); 

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    const newUser =  new User({
        email: req.body.username,
        password: md5(req.body.password)

    });
    newUser.save(function(err){
        if(err) {
            console.log(err);
        }else {
            res.render("secrets");
        }
    });

    app.post("/login", function(req, res){
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({email:username}, function(err, foundUser){
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    if (foundUser.password === password) {
                        res.render("secrets");
                    }
                }
            }
        });

        });
});



app.listen(3000, function() {
    console.log("Serevr started on port 3000.")
});