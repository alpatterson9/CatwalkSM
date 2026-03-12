/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * ODM to be used for posts in Catwalk with mongoDB
 */
const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const crypto = require("crypto");

/**
 * Schema used to model comments on user posts
 */
const commentSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    commentID: {
        type: String,
        default: () => crypto.randomUUID(),
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Schema used to model user posts
 */
const postSchema = new mongoose.Schema({
    postID: {
        type: String,
        default: () => crypto.randomUUID(),
        unique: true,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    username: {
        type: String
    },
    image: {
        data: Buffer, //data is storing raw binary of an image
        contentType: String,
    },
    text: {
        type:String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: [String],
        default: [],
    },
    comments: {
        type: [commentSchema],
        default: [],
    }
});

const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);

module.exports = {Post, Comment};