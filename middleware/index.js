// all middlewares are here
var Post = require("../models/post");
var Comment    = require("../models/comment");
var Group      = require("../models/group");

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

middlewareObj.isAdmin = function (req, res, next) {
    if (req.isAuthenticated()){
        if(req.user.usertype === 0){
            return next();
        }
    }

    // send flash message for the next request if error
    req.flash("error", "You Have To be Admin To Add new Group");
    res.redirect("/groups");
}

middlewareObj.isAllowed = function (req, res, next) {
    // is user logged in
    if (req.isAuthenticated()) {
        // find the Group with the requested id
        Group.findById(req.params.id, function (err, foundGroup) {
            if (err) {
                req.flash("error", "Group not found!");
                res.redriect("back");
            } else {
                // does the user allow to enter the group?

                if (foundGroup.creator.id.equals(req.user._id)) {
                    next();
                } else if(foundGroup.adminName.equals(req.user.username)){
                    next();
                }
                else {
                    var user = foundGroup.users.findById(req.user._id);
                    if(user !== null){
                        if(user.userstatus.equals(1)){
                            next();
                        }
                    }
                    req.flash("error", "You don't have permission to Enter this Group!");
                    res.redirect("back");
                }
            }
        });
    } else {
        // send flash notification to user to log in first
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }

}

// middleware to check if the user has the Group ownership
middlewareObj.checkGroupOwnership = function (req, res, next) {
    // is user logged in
    if (req.isAuthenticated()) {
        // find the campground with the requested id
        Group.findById(req.params.id, function (err, foundGroup) {
            if (err) {
                req.flash("error", "Group not found!");
                res.redriect("back");
            } else {
                // does the user own the campground?
                if (foundGroup.author.id.equals(req.user._id)) {
                    next();
                } else if(foundGroup.admin.id.equals(req.user._id)){
                    next();
                }
                else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        // send flash notification to user to log in first
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}

// middleware to check if the user Status
middlewareObj.checkStatus = function (req, res, next) {
    // is user logged in
    if (req.isAuthenticated()) {
        // find the campground with the requested id
        Group.findById(req.params.id, function (err, foundGroup) {
            if (err) {
                req.flash("error", "Group not found!");
                res.redriect("back");
            } else {
                //does the user send previous request
                var user = foundGroup.users.findById(req.user._id);
                if(user === null){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        // send flash notification to user to log in first
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}
//
// // middleware to check if the user has the campground ownership
// middlewareObj.checkCampgroundOwnership = function (req, res, next) {
//     // is user logged in
//     if (req.isAuthenticated()) {
//         // find the campground with the requested id
//         Campground.findById(req.params.id, function (err, foundCampground) {
//             if (err) {
//                 req.flash("error", "Campground not found!");
//                 res.redriect("back");
//             } else {
//                 // does the user own the campground?
//                 if (foundCampground.author.id.equals(req.user._id)) {
//                     next();
//                 } else {
//                     req.flash("error", "You don't have permission to do that!");
//                     res.redirect("back");
//                 }
//             }
//         });
//     } else {
//         // send flash notification to user to log in first
//         req.flash("error", "You need to be logged in to do that!");
//         res.redirect("back");
//     }
// }
//
// // middleware to check if the user has the comment ownership
// middlewareObj.checkCommentOwnership = function (req, res, next) {
//     // is user logged in
//     if (req.isAuthenticated()) {
//         // find the campground with the requested id
//         Comment.findById(req.params.comment_id, function (err, foundComment) {
//             if (err) {
//                 res.redriect("back");
//             } else {
//                 // does the user own the comment?
//                 if (foundComment.author.id.equals(req.user._id)) {
//                     next();
//                 } else {
//                     req.flash("error", "You don't have permission to do that!");
//                     res.redirect("back");
//                 }
//             }
//         });
//     } else {
//         // send flash notification to user to log in first
//         req.flash("error", "You don't have permission to do that!");
//         res.redirect("back");
//     }
// }

module.exports = middlewareObj;