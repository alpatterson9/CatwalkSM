/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * This file contains all of the routes that connect to mongoDB
 */
const express = require('express');
const { Post, Comment } = require('../db/postModel.js');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage })
const isMongoReady = require("../db/mongo.js")

const router = express.Router();

/**
 * Route used to create a new post
 */
router.post("/create", upload.single('image'), async (req, res) => {
    try {
        console.log("here");
        const { userID, text, username } = req.body;
        if (!userID || !text && !req.file)
            return res.status(400).json({ error: "Missing userID or content." });
        if (text && text.length > 200) {
            return res.status(400).json({
                error: "Post text cannot " +
                    "exceed 200 characters."
            });
        }
        let image = null
        if (req.file) {
            image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        }

        // creates new post in mongo
        const newPost = await Post.create({ userID, text, image, username });
        res.status(201).send({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Server error' });
    }
});

/**
 * Gets the Ids of all posts currently in the database
 * 
 * Currently used on home page to display all existing posts.
 * Will most likely need to change this down the line to retrieve and render
 * a set maximum number of posts at a time for the sake of performance
 */
router.get("/getAllPostIds", async (req, res) => {
    try {
        const posts = await Post.find({}, 'postID');
        const postIds = posts.map(p => p.postID);
        console.log(postIds);
        res.json(postIds);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Server error' });
    }
});

/**
 * Gets the Ids of all posts currently in the database
 * 
 * Currently used on home page to display all existing posts.
 * Will most likely need to change this down the line to retrieve and render
 * a set maximum number of posts at a time for the sake of performance
 */
router.get("/getUserPostIds/:userID", async (req, res) => {
    try {
        const { userID } = req.params;
        const posts = await Post.find({ "userID": userID }, 'postID');
        const postIds = posts.map(p => p.postID);
        console.log(postIds);
        res.json(postIds);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Server error' });
    }
});

/**
 * Route used to like a post. takes a post ID and a userID, then adds
 * that user to the likes array
 */
router.post("/:postID/like/:userID", async (req, res) => {
    try {
        const { postID, userID } = req.params;

        const post = await Post.findOne({ postID });

        if (!post) return res.status(404).send({ error: 'Error: Post not found.' });

        if (post.likes.includes(userID)) {
            post.likes.pull(userID);
        } else {
            post.likes.push(userID);
        }

        post.save();

        res.json({ likes: post.likes })
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Server error' });
    }
});

/**
 * Route used to get data of a post from post ID
 */
router.get("/:postID", async (req, res) => {
    try {
        const { postID } = req.params;
        const post = await Post.findOne({ postID });

        if (!post) return res.status(404).json({ error: "Post not found." });

        res.json({
            postID: post.postID,
            userID: post.userID,
            username: post.username,
            text: post.text,
            image: post.image.data ? post.image.data.toString('base64') : null,
            contentType: post.image.contentType ? post.image.contentType : null,
            likes: post.likes,
            comments: post.comments
        });
    } catch (err) {
        console.error("Error fetching post: ", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * Route used to add a comment to a post
 */
router.put("/:postID/comment/:userID", async (req, res) => {
    try {
        const { postID, userID } = req.params;
        const { text } = req.body;
        const post = await Post.findOne({ postID });
        if (!post) return res.status(404).send({ error: "Error: Post not found." });
        const comment = await Comment.create({ userID, text });
        post.comments.push(comment);
        post.save();

        res.json({ comments: post.comments });
    } catch (e) {
        console.error("Error adding comment", e);
        res.status(500).json({ error: "Server error" });
    }
})

/**
 * Route used to delete a post by postID
 */
router.delete("/:postID", async (req, res) => {
    try {
        const { postID } = req.params;
        const post = await Post.findOneAndDelete({ postID });

        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        res.json({ ok: true, message: "Post deleted successfully." });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * Route used to clear all comments from a post by postID
 */
router.delete("/:postID/comments", async (req, res) => {
    try {
        const { postID } = req.params;
        const post = await Post.findOne({ postID });

        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        post.comments = [];
        await post.save();

        res.json({ ok: true, message: "All comments cleared successfully.", comments: [] });
    } catch (err) {
        console.error("Error clearing comments:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/ready", (req, res) => {
    if (!isMongoReady()){
        return res.status(500).json( {error: "Mongo not connected" })
    }
    res.status(201).send({ ok: true });
})

module.exports = router;