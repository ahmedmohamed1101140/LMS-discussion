var mongoose = require("mongoose");

// schema set up
var postSchema = new mongoose.Schema({
    content: String,
    image: {type: String, default: null},
    comments_num: {type: Number, default: 0},
    created: {type: Date , default: Date.now()},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        userimage: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

// create post model using the schema and export it
module.exports = mongoose.model("Post", postSchema);

