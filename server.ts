import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import winston from "winston";
import { WebSocket, WebSocketServer } from "ws";
import { processImage } from "./utils";
dotenv.config();

const PORT = process.env.PORT || 3000;
const MODEL_API_URL = process.env.MODEL_API_URL || "http://127.0.0.1:3002";
const logger = winston.createLogger({
	level: "info",
	format: winston.format.json(),
	transports: [new winston.transports.Console()],
});

const app = express();

app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface WebSocketWithId extends WebSocket {
	id: string;
}

const sendMessageToClient = (clientId: string, message: { type: string; data: any }) => {
	const clients = wss.clients as Set<WebSocketWithId>;
	clients.forEach((client) => {
		if (client.id === clientId) {
			client.send(JSON.stringify(message));
		}
	});
};

wss.on("connection", (ws: WebSocketWithId) => {
	ws.id = uuidv4();
	logger.info(`Received connection from client ${ws.id}`);

	logger.info(`Successfully connected with client ${ws.id}`);

	ws.on("message", async (message: any) => {
		message = JSON.parse(message);

		if (message.type === "handshake") {
			sendMessageToClient(ws.id, {
				type: "handshake",
				data: {
					status: "success",
				},
			});
		} else if (message.type === "predict") {
			try {
				const data = {
					image_data: await processImage(message.data.image_data),
				};
				const response = await axios.post(MODEL_API_URL + "/model/predict", data);

				sendMessageToClient(ws.id, {
					type: "prediction",
					data: {
						status: "success",
						prediction: response.data.prediction,
						probability: response.data.probability,
					},
				});
			} catch (error) {
				logger.error(error);
				sendMessageToClient(ws.id, {
					type: "prediction",
					data: {
						status: "error",
						message: "Failed to predict, please try again.",
					},
				});
			}
		}
	});

	ws.on("close", () => {
		logger.info(`${ws.id} disconnected`);
	});
});

server.listen(PORT, () => {
	logger.info(`Server is listening at ${PORT}`);
});
