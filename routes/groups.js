var express    = require("express");
var router     = express.Router({mergeParams: true});
var Group = require("../models/group");
var User = require("../models/user");
var middleware = require("../middleware");

// INDEX -- view all Group, GET route
router.get("/", function (req, res) {
    // get all Groups data from Datebase
    Group.find({}, function (err, allGroups) {
        if (err) {
            console.log(err);
        } else {
            res.render("groups/index", {groups: allGroups, currentUser: req.user});
        }
    });
}); //worked

// NEW -- new Group form, GET route
router.get("/new", middleware.isAdmin, function (req, res) {
    User.find({usertype:1},function (err,allUsers) {
       if(err){
           console.log(err);
       }
       else{
           res.render("groups/new" , {users: allUsers});
       }
    });
});

// CREATE -- create new Group, POST route
router.post("/", middleware.isAdmin, function (req, res) {
    // get data from the form
    var name = req.body.name;
    var image = req.body.image;
    var creator = {
        id: req.user._id,
        username: req.user.username,
        userimage: req.user.image
    };

    var newGroup = {name: name, image: image, adminName: req.body.sel1 , creator: creator};
    // create a new Group and save it to the Database
    Group.create(newGroup, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            console.log(newlyCreated);
            // redirect to the Groups route

            //add this group to the admin and the creator
            var creator = User.findById(req.user._id);
            creator.groups.push(newlyCreated);
            creator.save();
            console.log(creator);
            User.find({username:req.body.sel1},function (err,foundAdmin) {
                foundAdmin.groups.push(newlyCreated);
                foundAdmin.save();
                console.log(foundAdmin);
            });

            req.flash("success", "Your Group "+ newlyCreated.name +" Added Successfully");
            res.redirect("/groups");
        }
    });
});

// SHOW -- display info about a specific Group, GET route
router.get("/:id", middleware.isAllowed , function (req, res) {
    // find the Group with provided ID
    Group.findById(req.params.id).populate("posts").exec(function (err, foundGroup) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundGroup);
            // render the show template with the foundGroup
            res.render("groups/show", {group: foundGroup});
        }
    });
});

// EDIT Group route
router.get("/:id/edit", middleware.checkGroupOwnership, function(req, res) {
    // find the Group with the requested id
    Group.findById(req.params.id, function (err, foundGroup) {
        if (err)
            console.log(err);
        // parse foundGroup to the edit template and render it
        res.render("groups/edit", {group: foundGroup});
    });
});

// UPDATE Group route
router.put("/:id", middleware.checkGroupOwnership, function(req, res) {
    // find and update the correct group
    var name = req.body.name;
    var image = req.body.image;
    var creator = {
        id: req.user._id,
        username: req.user.username,
        userimage: req.user.image
    };
    User.findById(req.admin_id,function (err,admin_data) {
        var admin = {
            id: req.admin_id,
            username: admin_data.username,
            userimage: admin_data.userimage
        };
        var newGroup = {name: name, image: image, admin: admin, creator: creator};

        Group.findByIdAndUpdate(req.params.id, newGroup, function(err, updatedGroup) {
            // redirect to Groups page or page with specific id
            if (err) {
                res.redirect("/groups");
            } else {
                res.redirect("/groups/" + req.params.id);
            }
        });
    });

});

// DESTROY Groups route
router.delete("/:id", middleware.isAdmin, function(req, res) {
    // delete a group with given id and redirect to groups page
    Group.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/groups");
        } else {
            req.flash("success","Group Deleted!")
            res.redirect("/groups");
        }
    });
});

router.post("/:id/request",middleware.checkStatus,function (req,res) {

    //find the group that the user want to join by the group id
   Group.findById(req.params.id,function(err,foundGroup){
      var user = {
          id: req.user._id,
          username: req.user.username,
          userstatus: 0
      };
      //push the user to the group but don't allow him
      foundGroup.users.push(user);
      foundGroup.save();

       // redirect to the SHOW router
       req.flash("success", "Request Sent!");
       res.redirect("/groups");
   });
});

// form the form i will send to id user id and group id to accept the user
router.post("/:group_id/user/:user_id",middleware.checkGroupOwnership,function (req,res) {
    Group.findById(req.params.group_id,function (err,foundGroup) {
        var user = foundGroup.user.findById(req.params.user_id);
        user.userstatus = 1;
        user.save();
        foundGroup.users.findByIdAndUpdate(req.params.user_id,user,function (err,updatedUser) {
           if (err) {
               res.redirect("back");
           } else {
               // redirect to the show page for the campsite
               foundGroup.save();
               User.findById(req.params.user_id,function (err,foundUser) {
                   var group = {
                       id : req.params.group_id,
                       groupname: foundGroup.name
                   };
                   foundUser.groups.push(group);
                   foundUser.save();
               });
               req.flash("success", "user Successfully added!");
               res.redirect("back");
           }
       });
    });
});

router.get("/:id/requests",middleware.checkGroupOwnership,function (req,res) {
    Group.findById(req.params.id).populate("users").exec(function (err, foundGroup) {
        if (err) {
            console.log(err);
        } else {
            res.render("groups/request", {group: foundGroup, currentUser: req.user});
        }
    });
});

// export the router module
module.exports = router;