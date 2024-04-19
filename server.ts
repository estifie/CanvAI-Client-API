import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import winston from "winston";
import { WebSocketServer } from "ws";
import { processImage } from "./utils";
dotenv.config();

const PORT = process.env.PORT || 3000;
const MODEL_API_URL = process.env.MODEL_API_URL || "http://127.0.0.1:3002";
const clients: { [key: string]: any } = {};
const logger = winston.createLogger({
	level: "info",
	format: winston.format.json(),
	transports: [new winston.transports.Console()],
});

const app = express();

app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const sendMessageToClient = (clientId: string, message: any) => {
	const client = clients[clientId];
	if (client) {
		client.send(JSON.stringify(message));
	}
};

wss.on("connection", (ws: any) => {
	const clientId = uuidv4();
	console.log(`Received connection from client ${clientId}`);
	logger.info(`Received connection from client ${clientId}`);

	clients[clientId] = ws;
	console.log(`Successfully connected with client ${clientId}`);
	logger.info(`Successfully connected with client ${clientId}`);

	ws.on("message", async (message: any) => {
		message = JSON.parse(message);

		if (message.type === "handshake") {
			sendMessageToClient(clientId, {
				type: "handshake",
				message: "Successfully connected",
			});
		} else if (message.type === "predict") {
			try {
				const data = {
					image_data: await processImage(message.data.image_data),
				};
				const response = await axios.post(MODEL_API_URL + "/model/predict", data);

				sendMessageToClient(clientId, {
					type: "predict",
					data: {
						prediction: response.data.prediction,
						probability: response.data.probability,
					},
				});
			} catch (error) {
				console.log(error);
				logger.error(error);
				sendMessageToClient(clientId, { type: "error", message: "Failed to predict" });
			}
		}
	});

	ws.on("close", () => {
		logger.info(`${clientId} disconnected`);
	});
});

server.listen(PORT, () => {
	logger.info(`Server is listening at ${PORT}`);
});
