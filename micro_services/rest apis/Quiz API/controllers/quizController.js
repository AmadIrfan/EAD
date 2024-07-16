const { db } = require("../utils/db");
const quizModel = require("../models/quizModels");

async function getQuestions(req, res) {
	const result = await quizModel.find();
	console.log(result);
	res.status(200).json({
		status: "ok",
		message: "successful",
		data: result,
	});
}

async function postQuestions(req, res) {
	try {

		let question = await quizModel.create(req.body);
		res.status(201).json({
			status: "ok",
			message: "successfully inserted ",
			data: question,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: error.message,
		});

	}
}
async function postManyQuestions(req, res) {
	try {
		let question = await quizModel.insertMany(req.body);
		res.status(201).json({
			status: "ok",
			message: "successfully inserted ",
			data: question,
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: error.message,
		});

	}
}

async function updatesQuestions(req, res) {
	const { id } = req.params;
	let question = await quizModel.findByIdAndUpdate(id, req.body);
	res.status(200).json({
		status: "ok",
		message: "successfully Updated ",
		data: req.body,
	});
}
async function deleteQuestions(req, res) {
	const { id } = req.params;
	let question = await quizModel.findByIdAndDelete(id);
	res.status(200).json({
		status: "ok",
		message: "successfully Deleted ",
		data: question,
	});
}
module.exports = {
	getQuestions,
	postQuestions,
	postManyQuestions,
	updatesQuestions,
	deleteQuestions,
};
