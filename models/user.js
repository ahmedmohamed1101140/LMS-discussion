// import package
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

// create a User schema
var UserSchema = new mongoose.Schema({
    username      : {type: String, unique: true},
    password      : String,
    finstname     :{type: String, default: null},
    secondname    :{type: String, default: null},
    email         :{type: String,default:null},
    image         : {type: String, default:"https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/user_male2-512.png"},
    usertype      :{type: Number, default:2}, //0 is admin 1 is instructor 2 is student
    created       :{type: Date , default: Date.now()},
    groups: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group"
        }
    ]
});

UserSchema.plugin(passportLocalMongoose); // adding method to user

// export the model
module.exports = mongoose.model("User", UserSchema);