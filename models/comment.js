var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    content: String,
    created:{type:Date , default: Date.now()},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        userimage: String
    }
});

module.exports = mongoose.model("Comment", commentSchema);