const express = require("express");
const router = express.Router();
const {
	getQuestions,
	postQuestions,
	postManyQuestions,
	deleteQuestions,
	updatesQuestions,
} = require("../controllers/quizController");

router.get("/questions", getQuestions);
router.post("/questions", postQuestions);
router.post("/questions/many", postManyQuestions);
router.put("/questions/:id", updatesQuestions);
router.delete("/questions/:id", deleteQuestions);

module.exports = router;
