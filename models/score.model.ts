import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema({
	score: {
		type: Number,
		required: true,
	},
	date: {
		type: Date,
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
});

ScoreSchema.set("toJSON", {
	transform: (_document: any, returnedObject: any) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

const Score = mongoose.model("Score", ScoreSchema);

export default Score;
