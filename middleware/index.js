// all middlewares are here
var Post        = require("../models/post");
var Comment     = require("../models/comment");
var Group       = require("../models/group");
var User        = require("../models/user");
// declare a empty middleware object
var middlewareObj = {};

// middleware to detect if the user is logged in
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    
    // send flash message for the next request if error
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}

//Check If the User that request page is admin or instructor
middlewareObj.isAdmin = function (req, res, next) {
    if (req.isAuthenticated()){
        if(req.user.usertype === 0){
            return next();
        }
        else if(req.user.usertype === 1){
            return next();
        }
        else {
            // send flash message for the next request if error
            req.flash("error", "You Have To be Admin or Instructor To Add new Group");
            res.redirect("/groups");
        }
    }
    else{
        // send flash message for the next request if error
        req.flash("error", "You Have To Log In First");
        res.redirect("/groups");
    }
}

//Check If this User Should enter this group or not
middlewareObj.isAllowed = function (req, res, next) {
    // is user logged in
    var x = 1;
    if (req.isAuthenticated()) {
        User.findById(req.user._id).populate("groups").exec(function (err,foundUser) {
            foundUser.groups.forEach(function (group) {
               if(group._id.equals(req.params.id)){
                   next();
                   x = 0;
               }
            });
            if(x === 1){
                req.flash("error","You Don't Have The Permission To Enter This Group ya ahmed");
                res.redirect("back");
            }
        });
    } else {
        // send flash notification to user to log in first
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }

}

//check if the user who want to delete of update group data is the admin of this group
middlewareObj.isGroupOwner = function (req, res, next) {
    if (req.isAuthenticated()){
        Group.findById(req.params.id,function (err,foundGroup) {
            if(err){
                console.log(err);
            }
            else {
                if(foundGroup.admin.id.equals(req.user._id)){
                    next();
                }
                else {
                    // send flash message for the next request if error
                    req.flash("error", "You Have To be The Admin Of The Group To Edit/Delete This Group");
                    res.redirect("/groups");
                }
            }
        });
    }
    else{
        // send flash message for the next request if error
        req.flash("error", "You Have To Log In First");
        res.redirect("/groups");
    }


}

// middleware to check if the user Send pervious request ro join this group or not
middlewareObj.checkStatus = function (req, res, next) {
    // is user logged in
    if (req.isAuthenticated()) {
        // find if the user send previous request or not
        var x = 1;
        Group.findById(req.params.id).populate("users").exec(function (err,foundGroup) {
            if(err){
                console.log(err);
            }
            else {
                if(foundGroup.admin.id.equals(req.user._id)){
                    req.flash("error", "Your Are The Admin Of This Group What You Doing ?!");
                    res.redirect("back");
                }
                else {
                    foundGroup.users.forEach(function (user) {
                        if(user.id.equals(req.user._id)){
                            x=0;
                            if(user.userstatus === 0){
                                req.flash("error", "Your Request Has Been Sent Wait until Acceptance!");
                                res.redirect("back");
                            }
                            else {
                                req.flash("success", "You already Have The Access To Enter This Group!");
                                res.redirect("back");
                            }
                        }
                    });
                    if(x === 1){
                        console.log("your request has been sent");
                        next();
                    }
                }
            }
        })

    } else {
        // send flash notification to user to log in first
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}

//delete the Group With all it's posts and Comments and also Delete the group from the users
middlewareObj.deleteAssociations = function (req,res,next) {
    Group.findById(req.params.id).populate("posts").exec(function (err,foundGroup) {
        foundGroup.posts.forEach(function (post) {
            //find the post then find all it's comments and delete them
            Post.findById(post._id).populate("comments").exec(function (err,foundPost) {
                foundPost.comments.forEach(function (comment) {
                    Comment.findByidAndRemove(comment._id,function (err) {
                       if(err){
                           console.log(err);
                       }
                       else {
                           console.log("Comment Deleted");
                       }
                    });
                });
            });
            // now delete this post
            Post.findByIdAndRemove(post._id,function (err) {
                if(err){
                    console.log(err);
                }
                else {
                    console.log("Post Deleted");
                }
            });
        });
    });
    //Delete this Group from All users
    //first Delete from the admin
    deleteGroupFromUser(req.user._id,req);

    //Delete this Group From All Accepted Users
    Group.findById(req.params.id).populate("users").exec(function (err,founGroup) {
        founGroup.users.forEach(function (user) {
            if(user.userstatus === 1){
                console.log(user);
                deleteGroupFromUser(user.id,req);
            }
        });
    });

    next();
};

module.exports = middlewareObj;

// function to delete group from user `
function deleteGroupFromUser(id,req) {
    console.log("here is the ID "+id);
    User.findById(id,function (err,foundUser) {
        console.log(foundUser);
        foundUser.groups.pull(req.params.id);
        foundUser.save();
    });
}