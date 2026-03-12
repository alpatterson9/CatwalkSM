require('dotenv').config();
const neo4j = require('neo4j-driver');

// Create a driver instance
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEO4J_USER,
    process.env.NEO4J_PASSWORD
  ),
  {
    encrypted: false
  }
);


module.exports = driver;