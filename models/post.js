const mongoose = require("mongoose");
const Schema = mongoose.Schema
const Comment = require("./comment.js")

const postItems = new Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require:true
    },
    image: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbjpidNNgEsw5FilrgRG31qHay4kKeS_EnyQ&s",
        set: (v) => v === "" ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbjpidNNgEsw5FilrgRG31qHay4kKeS_EnyQ&s" : v,
    },
    imagePublicId: String,
    video: {
        type: String,
        default: "/resources/load.mp4",
        set: (v) => v === "" ? "/resources/load.mp4" : v,
    },
    videoPublicId: String,
    location: {
        type: String,
        require:true
    },
    state: {
        type: String,
        require:true
    },
    city: {
        type: String,
        require:true
    },
    mobile: {
        type: Number,
        require:true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    update: {
        type: String,
        default: "No update yet.",
        set: (v) => v === "" ? "No update yet." : v,
    },
    updatedBy: {
        type: String,
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment",
    }],
    date: {
        type: Date,
        default: () => new Date(),
    },
    isSolved: {
        type: Boolean,
        default: false
    },
    solvedBy: {
        type: String,
        default: "Not solved"
    }
});


postItems.post("findOneAndDelete", async (post) => {
    if (post) {
        await Comment.deleteMany({ _id: { $in: post.comments } });
    }
});

const Post = mongoose.model("Post", postItems);
module.exports = Post;  