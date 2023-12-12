require("dotenv").config();

const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI;

async function main() {
  await mongoose.connect(mongoUri);
  console.log("Connect with Mongoose");
}

main().catch((err) => console.log(err));

module.exports = mongoose;
