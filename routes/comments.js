var express    = require("express");
var router     = express.Router({mergeParams: true});
var Group      = require("../models/group");
var User       = require("../models/user");
var Post       = require("./models/post");
var Comments   = require("./models/comment");
var middleware = require("../middleware");


//groups/:id/posts/:post_id/comments


//INDEX
router.get('/',function (req,res) {

    Post.findById(req.params.post_id).populate("comments").exec(function (err, Post) {
        if (err) {
            console.log(err);
        } else {

            res.render('Posts/show',{Post:Post ,Group_id:req.params.id})
        }
    });
});

//New- already in the page
router.get("/new",function (req,res) {

});
//Show - the comment does  not contain any sub things
router.get('/show',function (req,res) {
    
});

//CREATE -- create new Comment in post//
router.post("/",function (req,res) {

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
               Post.comments.push(ncomment);
               Post.save();
              res.redirect('/groups/'+req.params.id +'/posts/'+req.params.post_id+'/comments');
        }
           });
        }
    });
});

//Edit -form
router.get('/:comment_id/edit', function (req,res) {

    Comments.findById(req.params.comment_id,function (err,comment) {
        if(err){
            console.log(err);
        }
        else {

            res.render('Comments/edit',{Comment:comment ,Group_id:req.params.id, Post_id:req.params.id});

        }
    });

});

//Update Comment
router.put('/:comment_id',function (req,res) {

     var newComment={content:req.body.content};

    Comments.findByIdAndUpdate(req.params.comment_id,newComment,function (err,comment) {
        if(err){console.log(err);
          res.redirect('back');
        }
        else{
            res.redirect('/groups/'+req.params.id +'/posts/'+req.params.post_id+'/comments');
        }
    })

});

router.delete('/:comment_id', function (req,res) {

    Comments.findByIdAndRemove(req.params.comment_id, function (err) {
        if(err){console.log(err);}
        else{
            res.redirect('/groups/'+req.params.id +'/posts/'+req.params.post_id+'/comments')
        }
    });
});


module.exports = router;