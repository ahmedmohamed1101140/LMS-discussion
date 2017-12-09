var mongoose = require("mongoose");

// schema set up
var groupSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    image: {type: String , default: "https://d30zbujsp7ao6j.cloudfront.net/wp-content/uploads/2017/07/unnamed.png"},
    members: {type: Number, default: 1},
    post_num: {type: Number, default: 0},
    created: {type: Date , default: Date.now()},
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
    users: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        userstatus: Number
        // if we add the data we can know when the user register to this group
        // 0 not allow 1 allowed
    }]
});

groupSchema.pre("remove",function (next) {
    
});


// create groups model using the schema and export it
module.exports = mongoose.model("Group", groupSchema);

