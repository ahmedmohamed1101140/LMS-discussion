var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    Group          = require("./models/group"),
    Post           = require("./models/post"),
    Comment        = require("./models/comment"),
    User           = require("./models/user");

//george was here
// requiring routes
var commentRoutes    = require("./routes/comments"),
    postRoutes = require("./routes/posts"),
    groupRoutes = require("./routes/groups"),
    homeRoutes      = require('./routes/index');

mongoose.connect("mongodb://localhost/discussion_app");



// set up body-parser
app.use(bodyParser.urlencoded({extended: true}));
// set up the ejs view engine
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Everything is awesome",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//set up routes
app.use("/", homeRoutes);
// app.use("/posts", postRoutes);
// app.use("/posts/:id/comments", commentRoutes);




// set up the server
app.listen("3000", process.env.IP, function () {
    console.log("The YelpCamp server is running at port: 3000");
});