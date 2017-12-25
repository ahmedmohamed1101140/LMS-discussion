var express = require("express");
var router = express.Router({mergeParams: true});
var passport = require("passport");
var User  = require("../models/user");
var middleware = require("../middleware");



// default route
router.get("/", function (req, res) {
    res.render("landing");
});

//just for test
router.get("/home",function (req,res) {
    res.send(req.user);
    // res.render("landing");
});

// show register form
router.get("/register", function(req, res) {
    res.render("register");
});


// handle sign up logic
router.post("/register", function(req, res) {
    router// register an user from given request body
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function (err, user) {
        // callback details
        if (err) {
            // display flash error message from the database
            req.flash("error", err.message);
            console.log(err);
            return res.render("register");
        }
        // authenticate the given user
        passport.authenticate("local")(req, res, function () {
            // display the welcome flash notification and redirect
            req.flash("success", "Welcome to Our Discussion Board " + user.username);
            res.redirect("/profile");
        });
    });
});

// RENDER user profile page
router.get("/profile",middleware.isLoggedIn,function (req, res) {
    User.findById(req.user._id).populate("groups").exec(function (err,founduser) {
        if(err){
            console.log(err);
        }
        else {
            res.render("profile",{currentUser:founduser});
        }
    });
});

// UPDATE User DAta
router.post("/profile",middleware.isLoggedIn,function (req, res) {
    var user={
        firstname : req.body.firstname,
        lastname  : req.body.lastname,
        email     : req.body.email,
        image     : req.body.image
    };
    User.findByIdAndUpdate(req.user._id,user,function(err,updatedUser){
        if(err){
            console.log(err);
        }
        else {
            console.log(user);
            console.log(updatedUser);
            req.flash("success","You Profile Updated Successfully");
            res.redirect("/groups");
        }
    });
});

router.get("/iwanttobeanadmin",middleware.isLoggedIn,function (req,res) {
    User.findById(req.user._id,function (err,founduser) {
       founduser.usertype = 1;
       founduser.save();
       req.flash("success","Congratulation "+founduser.username+" You Now Is an Admin");
       res.redirect("/groups");
    });
});
// show login form
router.get("/login", function(req, res) {
    res.render("login");
});

// handling login logic with passport middleware
router.post("/login",passport.authenticate("local",
    {
        successRedirect: "/groups",
        failureRedirect: "/login"
    }),function (req , res) {
});

// log out route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out!"); // handle logout flash msg
    res.redirect("/");
});

// export the router module
module.exports = router;