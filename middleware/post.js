var Post        = require("../models/post");
var Comment     = require("../models/comment");
var Group       = require("../models/group");
var User        = require("../models/user");

var middlewareObj = {};



middlewareObj.deletePostAssociation=function (req,res,next) {

    Post.findById(req.params.post_id).populate("comments").exec(function (err,FoundPost) {

        if(err){console.log(err);}
        else{
            FoundPost.comments.forEach(function (comment) {
                 // remove all its comments.
                Comment.findByIdAndRemove(comment._id,function (err) {
                    if(err){
                        console.log(err);
                    }
                    else {
                        console.log("Comment Deleted");
                    }
                });
            });
        }
    });
    next();
}




middlewareObj.IsPostOwner=function (req, res,next) {
    if (req.isAuthenticated()){

        Post.findById(req.params.post_id,function (err,foundPost) {
            if(err){
                console.log(err);
            }
            else {
                if(foundPost.author.id.equals(req.user._id)){
                    next();
                }
                else {
                    // send flash message for the next request if error
                    req.flash("error", "You Have To be The author Of The Post To Edit/Delete it");
                    res.redirect('back');
                }
            }
        });

    }
    else{
        // send flash message for the next request if error
        req.flash("error", "You Have To Log In First");
        res.redirect('/login');
    }

}

middlewareObj.IsCommentOwner=function (req, res,next) {
    if (req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function (err,foundComment) {
            if(err){
                console.log(err);
            }
            else {
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                }
                else {
                    // send flash message for the next request if error
                    req.flash("error", "You Have To be The author Of The Post To Edit/Delete it");
                    res.redirect('back');
                }
            }
        });

    }
    else{
        // send flash message for the next request if error
        req.flash("error", "You Have To Log In First");
        res.redirect('/login');
    }

}


middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated())
        return next();

    // send flash message for the next request if error
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}






module.exports = middlewareObj;