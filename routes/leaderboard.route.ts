import { Router } from "express";
import Score from "../models/score.model";

const router = Router();

router.get("/", async (req, res) => {
	try {
		const highscores = await Score.find().sort({ score: -1 }).limit(10);

		res.json({
			status: "success",
			data: {
				highscores: highscores,
			},
		});
	} catch (error) {
		res.json({
			status: "error",
			message: "Failed to retrieve highscores",
		});
	}
});

export default router;
