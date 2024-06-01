import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const MODEL_API_URL = process.env.MODEL_API_URL || "http://127.0.0.1:3002";
export const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING || "";
