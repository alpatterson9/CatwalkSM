/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * This file initializes an Express server with routes set up to handle
 * user requests. In our case they are intended to come from the
 * React client.
 */
require('dotenv').config();
const { connectMongo, isMongoReady } = require('./db/mongo.js');
const express = require('express');
const cors = require('cors');
const mongoRoutes = require('./routes/mongoRoutes.js');
const pgRoutes = require('./routes/pgRoutes.js');
const cookieParser = require("cookie-parser");
const neo4jRoutes = require('./routes/neo4jRoutes.js');
const session = require('./db/neo4j.js');

//Token validation
const jwt = require("jsonwebtoken");

const app = express();
//cookies for token validation
app.use(cookieParser());



app.use(express.json());
// Enable CORS for all origins (for development)
app.use(cors({
        origin: "http://localhost:5173", // must match exactly
        credentials: true,
    }
));

// Initialize connection to MongoDB
//connectMongo();
app.use("/posts", mongoRoutes); // link mongo routes to server
app.use("/users", pgRoutes); //link postgres routes to server
app.use("/connections", neo4jRoutes); //link neo4j routes to server

//initializes express server
connectMongo();
app.listen(3000, () => console.log('Server listening on port 3000'));

