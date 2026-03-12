/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * This file contains all of the routes that connect to postgreSQL
 */
require('dotenv').config();
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
//const bcrypt = require('bcrypt');
const multer = require('multer');
const { Post } = require('../db/postModel.js');
//const jwt = require("jsonwebtoken");
const driver = require('../db/neo4j.js');
const {getAuth} = require("../firebaseAdmin");

// Initialize connection pool for Postgres
const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
});

// This query is solely here for debugging purposes. Tests connection to the database.
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection failed', err);
    } else {
        console.log('Connected to catwalk database');
        console.log(`Credentials: \n${process.env.POSTGRES_USER}\n${process.env.POSTGRES_PASSWORD}`)
    }
});

const app = express();

//image storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route used for creating an account on Catwalk
router.post('/signup', async (req, res) => {
    const session = driver.session();

    //Get Firebase ID token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Missing token." });

    //Read username from body
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Missing username" });

    try {
        //Verify Firebase token, get email
        const decoded = await getAuth().verifyIdToken(token);
        const userID = decoded.uid;
        const email = decoded.email;
        if (!email) return res.status(403).json({ error: "Token missing email." });

        const emailExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (emailExists.rowCount !== 0) {
        return res.status(409).json({ error: 'Email already exists', errorCode: 1 });
        }

        const usernameExists = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (usernameExists.rowCount !== 0) {
        return res.status(409).json({ error: 'Username already exists', errorCode: 2 });
        }

        //make user in postgres
        const pgResult = await pool.query(
        'INSERT INTO users (id, username, email) VALUES ($1, $2, $3) RETURNING id',
        [userID, username, email]
        );

        //const userID = pgResult.rows[0].id;

        //make user in neo
        await session.run(
        `CREATE (u:User {userid: $userID, username: $username})
        RETURN u`,
        { userID, username }
        );

        return res.status(201).json({ ok: true, userID });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    } finally {
        await session.close();
    }
    /* const session = driver.session();
    console.log("Receieved sign up request from: ", req.body);
    const { username, email, password } = req.body; //Receive email and password as plaintext
    if (!email || !password || !username) return res.status(400).send({ error: 'Missing username, email, or password' });

    try {
        //TODO combo errors
        // Return an error if the provided email or username already has an account
        const emailExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (emailExists.rowCount != 0) return res.status(409).json({ error: 'Email already exists', errorCode: 1 });
        const usernameExists = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (usernameExists.rowCount != 0) return res.status(409).json({ error: 'Username already exists', errorCode: 2 });

        // bcrypt is used here to apply a hash to user passwords.
        // Only the hashed version will be stored in the database.
        const hash = await bcrypt.hash(password, 10);

        const pgResult = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id', [username, email, hash]
        );

        const userID = pgResult.rows[0].id;
        const neoResult = await session.run(
            `CREATE (u:User {userid: $userID, username: $username})
             RETURN u`,
            { userID: userID, username }
        );

        const createdUser = neoResult.records[0].get('u').properties;
        console.log(createdUser);

        res.status(201).send({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    } */
});


//LEGACY: UNECCESSARY WITH FIREBASE
// Route used for logging into an already existing account
/* router.post('/login', async (req, res) => {
    //TODO potentially add login for username aswell
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ error: 'Missing email or password' });

    try {
        const result = await pool.query('SELECT id, password_hash, username FROM users WHERE email = $1', [email]);
        if (result.rowCount === 0) return res.status(401).send({ error: 'Invalid credentials' });

        const user = result.rows[0];
        // bcrypt checks that the provided password matches the hashed version in our database
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).send({ error: 'Invalid credentials' });

        const userId = user.id;
        //Generate access and refresh tokens for user
        //TODO check if these actually expire and behave accordingly
        const accessToken = jwt.sign({ userId }, process.env.ACCESS_SECRET, { expiresIn: "30m" });
        const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

        // Store refresh token in HttpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // only send over HTTPS, false for now since we're on localhost
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        });

        res.json({ user: user.username, token: accessToken, userID: userId })
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
}); */

//route for logging out (I'm fairly certain we don't use this anymore)
router.post("/logout", (req, res) => {
    console.log("Logging out");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
});

//route for fetching user profile data from a user id
router.get("/getProfileData/:profileID", async (req, res) => {
    const { profileID } = req.params;
    console.log("getting data");

    if (!profileID) return res.status(400).json({ error: "Error: Invalid userID." });

    try {
        const result = await pool.query('SELECT username, profile_picture, bio FROM users WHERE id = $1', [profileID]);
        const username = result.rows[0].username;
        const ppID = result.rows[0].profile_picture;
        const bio = result.rows[0].bio;
        res.json({ username: username, ppID: ppID, bio: bio });
    } catch (e) {
        console.log(e.message);
        res.status(400).json({ error: "Error: Invalid userID." });
    }
});

//route for fetching a username from a user id
router.get("/getUsername/:userID", async (req, res) => {
    const { userID } = req.params;
    console.log(userID);
    if (!userID) return res.status(400).json({ error: "Error: Invalid userID." });

    try {
        const result = await pool.query('SELECT username FROM users WHERE id = $1', [userID]);
        const username = result.rows[0].username;
        res.json({ username: username });
    } catch (e) {
        console.log(e.message);
        res.status(400).json({ error: "Error: Invalid userID." });
    }
});

//route for updating profile information
router.put("/updateProfile", upload.single('image'), async (req, res) => {
    try {
        const { userID, text } = req.body;
        if (!userID)
            return res.status(400).json({ error: "Missing userID or content." });

        if (req.file) {
            image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
            const result = await pool.query('SELECT username FROM users WHERE id = $1',
                [userID]);
            const username = result.rows[0].username;
            const profileText = `${username} updated their profile picture.`
            // creates new post in mongo with provided profile picture
            const profilePicture = await Post.create(
                { userID, text: profileText, image, username });
            await pool.query(`UPDATE users SET bio = $1 WHERE id = $2;`,
                [text, userID]);
            await pool.query(`UPDATE users SET profile_picture = $2 WHERE id = $1;`,
                [userID, profilePicture.postID]);
        }
        else {
            await pool.query('UPDATE users SET bio = $1 WHERE id = $2', [text, userID]);
        }
        res.status(201).send({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Server error' });
    }
})

//route for getting user data
router.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Missing token." });

    try {
        const decoded = await getAuth().verifyIdToken(token);

        const userID = decoded.uid;
        const email = decoded.email;
        if (!email) return res.status(403).json({ error: "Token missing email." });

        const result = await pool.query(
        "SELECT id, username FROM users WHERE id = $1",
        [userID]
        );

        if (result.rowCount === 0) {
        return res.status(404).json({ error: "No Postgres user for this account." });
        }

        const { id, username } = result.rows[0];
        return res.json({ user: username, userID: id });
    } catch (e) {
        console.log(e.message);
        return res.status(403).json({ error: "Invalid token." });
    }
    //get access token from request header
    /* const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Invalid token: undefined." });

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET);
        const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [decodedToken.userId]);
        const userID = result.rows[0];
        const user = result.rows[1];
        res.json({ user: user, userID: userID });
    } catch (e) {
        console.log(e.message);
        res.status(403).json({ error: "Invalid token." });
    } */
});

//ALSO LEGACY CAUSE OF FIREBASE
//route for checking refresh tokens
/* router.post("/refresh", async (req, res) => {
    console.log("In refresh now.");
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    try {
        const token = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [token.userId]);
        const userId = result.rows[0].id;
        const username = result.rows[0].username;
        const newAcessToken = jwt.sign({ userId }, process.env.REFRESH_SECRET, {
            expiresIn: "7d",
        });
        res.json({ accessToken: newAcessToken, user: username, userID: userId });
    } catch (e) {
        console.log(e.message);
        res.status(403).json({ error: "Invalid refresh token" });
    }
}); */

//route for searching for users
router.get("/search", async (req, res) => {
    const { q } = req.query;
    console.log(`query: ${q}`);
    //if (!query) return res.json([]);

    try {
        const result = await pool.query(
            `SELECT id
             FROM users
             WHERE username ILIKE $1 || '%' OR username % $1
             ORDER BY similarity(username, $1) DESC
             LIMIT 20`,
            [q]
        );
        console.log(result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


module.exports = router;