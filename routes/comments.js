var express    = require("express");
var router     = express.Router({mergeParams: true});
var Group      = require("../models/group");
var User       = require("../models/user");
var Post       = require("../models/post");
var Comments   = require("../models/comment");
var middleware = require("../middleware/post");


//groups/:id/posts/:post_id/comments


//INDEX
router.get('/',middleware.isLoggedIn,function (req,res) {

    Post.findById(req.params.post_id).populate("comments").exec(function (err, Post) {
        if (err) {
            console.log(err);
        } else {
            Group.findById(req.params.id,function (err,foundGroup) {
                if(err){
                    console.log(err);
                }
                else{
                    res.render('Posts/show2',{Post:Post , group: foundGroup , Group_id:req.params.id})
                }
            });

        }
    });
});

//CREATE -- create new Comment in post//
router.post("/",middleware.isLoggedIn,function (req,res) {

    Post.findById(req.params.post_id,function (err,Post) {

        if(err){console.log(err);
           console.log('can`t find that post');
          res.redirect('back');
        }
        else {
            var author = {
                id: req.user._id,
                username: req.user.username,
                userimage :req.user.image };

            var newcomment={content:req.body.content, author:author };
           Comments.create(newcomment,function (err,ncomment) {
        if(err){
               console.log('comment isn`t created');
              res.redirect('back');
              }
              else {
              console.log(Post.comments_num);
               Post.comments.push(ncomment);
               Post.comments_num++;
               console.log(Post.comments_num);
               Post.save();
              res.redirect('/groups/'+req.params.id +'/posts/'+req.params.post_id+'/comments');
        }
           });
        }
    });
});

//Edit -form
router.get('/:comment_id/edit',middleware.IsCommentOwner, function (req,res) {

    Comments.findById(req.params.comment_id,function (err,comment) {
        if(err){
            console.log(err);
        }
        else {

            res.render('Comments/edit',{Comment:comment ,Group_id:req.params.id, Post_id:req.params.post_id});

        }
    });

});

//Update Comment
router.put('/:comment_id',middleware.IsCommentOwner,function (req,res) {

    console.log(req.params.comment_id);
     var udpatedcomment={content:req.body.content};
    Comments.findByIdAndUpdate(req.params.comment_id,udpatedcomment,function (err,comment) {
        if(err){console.log(err);
          res.redirect('back');
        }
        else{
            console.log(comment);
            res.redirect('/groups/'+req.params.id +'/posts/'+req.params.post_id+'/comments');
        }
    })

});

//DELETE COMMENT
router.delete('/:comment_id',middleware.IsCommentOwner, function (req,res) {

    Comments.findByIdAndRemove(req.params.comment_id, function (err) {
        if(err){console.log(err);}
        else{
            res.redirect('/groups/'+req.params.id +'/posts/'+req.params.post_id+'/comments')
        }
    });

});


module.exports = router;