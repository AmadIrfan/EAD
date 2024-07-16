const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
const url = "mongodb://127.0.0.1:27017/QuizCollection";
mongoose.connect(url, {
});

const db = mongoose.connection;
db.on("error", () => {
	console.log("Error to connect with mdb ok...");
});

db.once("open", () => {
	console.log("connected with db");
});

module.exports = { db };
