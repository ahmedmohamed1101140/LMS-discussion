var express    = require("express");
var router     = express.Router({mergeParams: true});
var Group      = require("../models/group");
var User       = require("../models/user");
var Post       = require("../models/post");
var Comments   = require("../models/comment");
var middleware = require("../middleware");

// INDEX -- view all Group, GET route
router.get("/",middleware.isLoggedIn, function (req, res) {
    // get all Groups data from Datebase
    Group.find({}, function (err, allGroups) {
        if (err) {
            console.log(err);
        } else {
            User.findById(req.user._id).populate("groups").exec(function (err,founduser) {
               if(err){
                   console.log(err);
               }
               else {
                   res.render("groups/index", {groups: allGroups, currentUser: founduser});
                   // res.render("GUItest/index", {groups: allGroups, currentUser: founduser});
               }
            });
        }
    });
}); //WORKED

// INDEX -- view all Group, GET route
router.get("/mygroups",middleware.isLoggedIn, function (req, res) {
    // get all Groups data from Datebase
    User.findById(req.user._id).populate("groups").exec(function (err,foundUser) {
       if(err){
           console.log(err);
       }
       else {
           res.render("groups/mygroups",{user: foundUser});
           // res.render("GUItest/mygroups",{user:foundUser});
       }
    });
}); //WORKED

// NEW -- new Group form, GET route
router.get("/new", middleware.isAdmin, function (req, res) {
    // res.render("groups/new");
    User.findById(req.user._id).populate("groups").exec(function (err,foundUser) {
       if(err){
           console.log(err);
       }
       else {
           console.log(foundUser);
           res.render("groups/new");
           // res.render("GUItest/new",{user:foundUser});

       }
    });
}); //WORKED

// CREATE -- create new Group, POST route
router.post("/", middleware.isAdmin, function (req, res) {
    // get data from the form
    var name = req.body.name;
    var admin = {
        id: req.user._id,
        username: req.user.username,
        userimage: req.user.image
    };
    // create a new Group and save it to the Database
    var newGroup = {name: name, admin: admin };
    Group.create(newGroup,function (err,newlyCreated) {
        if(err){
            console.log(err);
            req.flash("error","Group Name Exist..");
            res.redirect("back");
        }
        else{
            //add the created group to the user
            User.findById(req.user._id,function (err,foundUser) {
                if(err){
                    console.log(err);
                }
                else
                {
                    foundUser.groups.push(newlyCreated);
                    foundUser.save();
                }
            });
            req.flash("success", "Your Group "+ newlyCreated.name +" Added Successfully");
            res.redirect("/groups");
        }
    });
}); //WORKED

// SHOW -- display info about a specific Group, GET route
router.get("/:id", middleware.isAllowed , function (req, res) {
    // find the Group with provided ID
    Group.findById(req.params.id).populate("posts").exec(function (err, foundGroup) {
        if (err) {
            console.log(err);
        } else {
            // render the show template with the foundGroup
            res.render("groups/show", {group: foundGroup});
            // res.render("GUItest/show", {group: foundGroup});
        }
    });
}); //WORKED

// EDIT -- Display Edit Form With Group Exist Data
router.get("/:id/edit", middleware.isGroupOwner, function(req, res) {
    // find the Group with the requested id
    Group.findById(req.params.id, function (err, foundGroup) {
        if (err) {
            console.log(err);
        }
        // parse foundGroup to the edit template and render it
        // res.render("groups/edit", {group: foundGroup});
        User.findById(req.user._id).populate("groups").exec(function (err,foundUser) {
            if(err){
                console.log(err);
            }
            else {
                res.render("groups/edit",{group:foundGroup});
                // res.render("GUItest/edit", {group: foundGroup,user:foundUser});

            }
        });
    });
}); //WORKED

// UPDATE -- Update The Group Data
router.put("/:id", middleware.isGroupOwner, function(req, res) {
    // find and update the correct group
    var name = req.body.name;

    var newGroup = {name: name};

    Group.findByIdAndUpdate(req.params.id, newGroup, function(err, updatedGroup) {
        // redirect to Groups page or page with specific id
        if (err) {
            console.log(err);
            req.flash("error","Error Happens While Update.. :(");
            res.redirect("/groups");
        } else {
            req.flash("success","Your "+updatedGroup.name+" Updated Successfully..");
            res.redirect("/groups/mygroups");
        }
    });
}); //WORKED

// DESTROY -- Delete the Group Information and all posts and comment associated with the group and delete it form all registered users
router.delete("/:id", middleware.isGroupOwner,middleware.deleteAssociations, function(req, res) {
    //Now Delete The Group Safely

    Group.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/groups");
        } else {
            req.flash("success","Group Deleted!");
            res.redirect("/groups");
        }
    });
}); //WORKED

//USER Send Request to Join Group
router.get("/request/:id",middleware.checkStatus,function (req,res) {
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
});// WORKED

// Accept USER Joining Request
router.get("/:group_id/user/:user_id",middleware.isAdmin,function (req,res) {
    Group.findById(req.params.group_id,function (err,foundGroup) {
        foundGroup.users.forEach(function (user) {
            if(user._id.equals(req.params.user_id)){
                user.userstatus = 1;
                user.save();
                console.log(user);
                foundGroup.members++;
                foundGroup.save();
                User.findById(user.id,function (err,foundUser) {
                    if(err){
                        console.log(err);
                    }
                    else {
                        foundUser.groups.push(foundGroup);
                        foundUser.save();
                    }
                });
                req.flash("success", "user Successfully added!");
                res.redirect("back");
            }
        });
    });
});


// export the router module
module.exports = router;