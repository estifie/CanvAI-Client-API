import http from "http";
import { v4 as uuidv4 } from "uuid";
import { WebSocket, WebSocketServer } from "ws";
import { GameStatus } from "./types";

export interface WebSocketWithId extends WebSocket {
	id: string;
	status: GameStatus;
	imageToDraw: string;
	startEpoch: number;
	duration: number;
	score: number;
	curentDrawingTimeStart: number;
}

export class Socket {
	wss: WebSocketServer;

	constructor(server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {
		this.wss = new WebSocketServer({ server });
	}
}
