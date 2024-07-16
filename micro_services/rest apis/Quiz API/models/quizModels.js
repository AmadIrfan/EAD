const mongoose = require("mongoose");

let quiz = new mongoose.Schema({
	question: {
		type: String,
		required: true,
		unique: true
	},
	answers: {
		type: Array,
		required: true,
	},
	correctAnswer: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
}, { timestamps: true });
let quizModel = mongoose.model("quizQuestions", quiz);
module.exports = quizModel;