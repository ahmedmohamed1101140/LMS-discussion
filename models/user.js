// import package
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

// create a User schema
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: {type: String, unique: true},
    image: {type: String, default:"https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/user_male2-512.png"},
    usertype: Number,
    created: {type: Date , default: Date.now()},
    groups: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Group"
        },
        groupname: String
    }
});

UserSchema.plugin(passportLocalMongoose); // adding method to user

// export the model
module.exports = mongoose.model("User", UserSchema);