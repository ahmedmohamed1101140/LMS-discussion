var express    = require("express");
var router     = express.Router({mergeParams: true});
var Group      = require("../models/group");
var User       = require("../models/user");
var Post       = require("../models/post");
var Comments   = require("../models/comment");
var middleware = require("../middleware/post");

///groups/:id/posts

// INDEX -- already in the groups show

// router.get("/",function (req, res) {
//
//     console.log(req.params.id);
//     Group.findById(req.params.id,function(err,Group){
//
//         if(err){console.log(err)}
//         else
//         {
//             res.render('/show',{Group:Group});
//         }
//
//     });
//
// });

//NEW - Form
router.get('/new',middleware.isLoggedIn,function (req,res){

    console.log(req.params.id);
    Group.findById(req.params.id,function(err,Group){

        if(err){console.log(err)}
        else
        {
            res.render('Posts/new',{Group:Group});
        }
    });

}); //working


//CREATE - Create an new Post in group
router.post("/",middleware.IsPostOwner,function (req, res) {

    Group.findById(req.params.id,function (err,group) {
        if(err){ console.log(err);}
        else{

            var content =req.body.content;
            var image =req.body.image;
            var author = {
                id: req.user._id,
                username: req.user.username,
                userimage :req.user.image };

            var newPost = {content: content,image:image,author:author};
            Post.create(newPost,function (err,newpost) {
                if(err){
                    console.log(err);
                    req.flash("error","the post is not created ");
                    res.redirect("back");
                }
                else{
                    group.posts.push(newpost);
                    group.post_num++;
                    group.save();
                    res.redirect("/groups/"+req.params.id);
                }
            });
        }
    });
});//working



//Edit- redirect to form
router.get('/:post_id/edit',middleware.IsPostOwner,function (req,res) {

    console.log('here');

    Post.findById(req.params.post_id,function (err,post) {
        if(err){console.log(err);
            res.redirect('back');
        }
        else{
            console.log(post);
            console.log(req.params.post_id);
            res.render('Posts/edit',{Post:post,Group_id:req.params.id})
        }

    });

});

router.put("/:post_id",middleware.IsPostOwner, function(req, res){

    Post.findByIdAndUpdate(req.params.post_id, req.body.Post, function(err, post){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/groups/"+req.params.id);
        }
    });
});


router.delete("/:post_id",middleware.IsPostOwner,middleware.deletePostAssociation,function(req, res){

    console.log("the delete req");

    Post.findByIdAndRemove(req.params.post_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/groups/"+req.params.id);
        }
    });

});




module.exports = router;