/**
 * Andrew Patterson, Elliott Scheid, Robin Howard
 * 
 * This file exports a function to connect to mongoDB via mongoose
 */
const mongoose = require("mongoose");
let mongoReady = false;
let mongoConnecting = false;

/**
 * Connects server to mongoDB locally
 */
async function connectMongo(){
  let delay = 1000;
  const maxDelay = 256000; //this retries the connecton so we can run express before mongo
  while (true){
    try {
    await mongoose.connect(process.env.MONGO_DB_NAME);
    mongoReady = true;
    console.log('MongoDB connected successfully!');
    return;
  } catch (err) {
    mongoReady = false;
    console.error('MongoDB connection error, retrying:', err);

    await new Promise((resolve) => setTimeout(resolve, delay));

    delay = delay * 2;
    if (delay > maxDelay){
      delay = maxDelay;
    }
    //process.exit(1);
    //don't want to exit anymore for the sake of containers
  }
  }
};

function isMongoReady(){
  return mongoReady;
}

module.exports = {connectMongo, isMongoReady};

