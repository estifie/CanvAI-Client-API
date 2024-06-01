import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { MODEL_API_URL } from "./config";
import { logger } from "./logger";
import { default as Score, default as ScoreModel } from "./models/score.model";
import { GameStatus } from "./types";
import { getRandomImage, processImage } from "./utils";
import { WebSocketWithId } from "./websocket";

export default class WebSocketHandler {
	client: WebSocketWithId;

	constructor(connection: WebSocketWithId) {
		this.client = connection;
		this.client.id = uuidv4();
		this.client.status = GameStatus.NOT_STARTED;
		this.client.score = 0;
		this.client.curentDrawingTimeStart = 0;
	}

	sendMessage = (message: any) => {
		this.client.send(JSON.stringify(message));
	};

	handleHandsake = () => {
		this.sendMessage({
			type: "handshake",
			data: {
				status: "success",
			},
		});
	};

	handleStart = async (message: any) => {
		try {
			if (this.client.status === GameStatus.IN_PROGRESS) {
				this.sendMessage({
					type: "start",
					data: {
						status: "error",
						message: "Game already in progress",
					},
				});
				return;
			}

			this.client.status = GameStatus.IN_PROGRESS;
			this.client.imageToDraw = getRandomImage();
			this.client.startEpoch = Date.now();
			this.client.duration = message.data.duration;
			this.client.curentDrawingTimeStart = Date.now();

			this.sendMessage({
				type: "start",
				data: {
					image: this.client.imageToDraw,
					message: `Game started! You have ${this.client.duration} seconds to draw the ${this.client.imageToDraw}.`,
					startEpoch: this.client.startEpoch,
				},
			});

			setTimeout(() => {
				this.handleFinish();
			}, this.client.duration * 1000);
		} catch (error) {
			this.client.status = GameStatus.NOT_STARTED;

			logger.error(error);

			this.sendMessage({
				type: "start",
				data: {
					status: "error",
					message: "Failed to start game",
				},
			});
		}
	};

	handleFinish = () => {
		this.client.status = GameStatus.NOT_STARTED;

		Score.create({
			score: this.client.score,
			date: new Date().toISOString(),
			username: "Guest",
		});

		this.sendMessage({
			type: "finish",
			data: {
				message: "Game finished!",
				score: this.client.score,
			},
		});
	};

	// Handle Prediction for development purposes only
	// Doesnt check if the game is in progress
	// Only predicts the image
	handlePredictionBasic = async (message: any) => {
		const data = {
			image_data: await processImage(message.data.image_data),
		};
		const response = await axios.post(MODEL_API_URL + "/model/predict", data);

		this.sendMessage({
			type: "prediction",
			data: {
				status: "success",
				prediction: response.data.data.prediction,
				probability: response.data.data.probability,
			},
		});
	};

	handlePrediction = async (message: any) => {
		try {
			if (this.client.status === GameStatus.NOT_STARTED) {
				this.sendMessage({
					type: "prediction",
					data: {
						status: "error",
						message: "Game not started yet",
					},
				});
				return;
			}

			let isPredicted = false;
			let timeTaken = 0;
			let gainedScore = 0;

			const data = {
				image_data: await processImage(message.data.image_data),
			};
			const response = await axios.post(MODEL_API_URL + "/model/predict", data);

			if (response.data.data.prediction === this.client.imageToDraw) {
				const currentDrawingTimeFinish = Date.now();
				timeTaken = currentDrawingTimeFinish - this.client.curentDrawingTimeStart;
				gainedScore = this.calculateScore(timeTaken);
				this.client.score += gainedScore;

				isPredicted = true;

				// Next image
				this.client.imageToDraw = getRandomImage();
				this.client.curentDrawingTimeStart = Date.now();
			}

			this.sendMessage({
				type: "prediction",
				data: {
					status: "success",
					prediction: response.data.data.prediction,
					probability: response.data.data.probability,
					isPredicted: isPredicted,
					timeTaken: isPredicted ? timeTaken : undefined,
					gainedScore: isPredicted ? gainedScore : undefined,
					nextImage: isPredicted ? this.client.imageToDraw : undefined,
				},
			});
		} catch (error) {
			logger.error(error);

			this.sendMessage({
				type: "prediction",
				data: {
					status: "error",
					message: "Failed to predict image",
				},
			});
		}
	};

	handleRetrieveHighscores = async () => {
		try {
			const highscores = await Score.find().sort({ score: -1 }).limit(10);

			this.sendMessage({
				type: "highscores",
				data: {
					status: "success",
					highscores: highscores,
				},
			});
		} catch (error) {
			logger.error(error);

			this.sendMessage({
				type: "highscores",
				data: {
					status: "error",
					message: "Failed to retrieve highscores",
				},
			});
		}
	};

	private calculateScore = (timeTaken: number): number => {
		const initialScore = 5000;
		const k = 0.0005;
		const score = initialScore * Math.exp(-k * timeTaken);

		return Math.max(1, Math.floor(score));
	};
}
