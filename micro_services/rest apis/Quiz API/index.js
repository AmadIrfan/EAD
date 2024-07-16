// @ts-nocheck
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const body_Parser = require("body-parser");
const quizRoutes = require("./routes/quizRoute");
app.use(cors());
app.use(body_Parser.json());

app.use(morgan("dev"));

app.use("/v1/quiz", quizRoutes);
app.get("/", (req, res) => {
	res.send("welcome to my quiz api services");
});
let PORT = 3001
app.listen(PORT, () => {
	console.log(`Server is running on PORT ${PORT}`);
});