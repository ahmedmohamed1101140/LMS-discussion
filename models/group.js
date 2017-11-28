var mongoose = require("mongoose");

// schema set up
var groupSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    image: {type: String , default: "https://d30zbujsp7ao6j.cloudfront.net/wp-content/uploads/2017/07/unnamed.png"},
    members: {type: Number, default: 0},
    post_num: {type: Number, default: 0},
    created: {type: Date , default: Date.now()},
    creator: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        userimage: String
    },
    admin: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        userimage: String
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    users: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        userstatus: Number
        // if we add the data we can know when the user register to this group
    }
});

// create groups model using the schema and export it
module.exports = mongoose.model("Group", groupSchema);

