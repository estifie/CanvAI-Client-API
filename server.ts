import axios from "axios";
import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { WebSocket, WebSocketServer } from "ws";
import { MODEL_API_URL, MONGODB_CONNECTION_STRING, PORT } from "./config";
import WebSocketHandler from "./handlers";
import { logger } from "./logger";
import leaderboardRouter from "./routes/leaderboard.route";
import { GameStatus } from "./types";
import { getRandomImage, processImage } from "./utils";
import { Socket, WebSocketWithId } from "./websocket";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/leaderboard", leaderboardRouter);

mongoose
	.connect(MONGODB_CONNECTION_STRING)
	.then(() => {
		logger.info("Connected to MongoDB");
	})
	.catch((error) => {
		logger.error("Error connecting to MongoDB: " + error.message);
	});

const server = http.createServer(app);

const socket = new Socket(server);

socket.wss.on("connection", (ws: WebSocketWithId) => {
	const client = new WebSocketHandler(ws);
	const connection = client.client;

	logger.info(`Received connection from client ${connection.id}`);
	logger.info(`Successfully connected with client ${connection.id}`);

	ws.on("message", async (message: any) => {
		try {
			message = JSON.parse(message);
			logger.info(`Received message from client ${connection.id}: ${message.type}`);

			switch (message.type) {
				case "handshake":
					client.handleHandsake();
					break;
				case "start":
					client.handleStart(message);
					break;
				case "prediction":
					client.handlePrediction(message);
					break;
				case "highscores":
					client.handleRetrieveHighscores();
					break;
				default:
					logger.warn("Invalid message type");
			}
		} catch (error) {
			client.sendMessage({
				type: "error",
				data: {
					message: "Failed to parse message",
				},
			});

			logger.error("Failed to parse message");
			return;
		}
	});

	ws.on("close", () => {
		logger.info(`${ws.id} disconnected`);
	});
});

server.listen(PORT, () => {
	logger.info(`Server is listening at ${PORT}`);
});
