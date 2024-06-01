# canvAI Client API

## Description

The CanvAI Client API is an API written in TypeScript designed to create a bridge between the frontend and the CanvAI
Core API.

## Installation

To install canvAI Client API, follow these steps:

1. Clone the repository

```bash
git clone https://github.com/axelnt/CanvAI-Client-API.git
```

2. Navigate to the project directory

```bash
cd CanvAI-Client-API
```

3. Install the dependencies

```bash
npm install
```

3. Create `.env` file: You can create the `.env` file by copying the `.env.example` file.

```bash
cp .env.example .env
```

## Usage

### Running the API

To run the API, you can run the following command:

```bash
npm run start
```

The API's PORT is set to `3000` by default. You can change the port by setting the environment variable `PORT`.

## Message Format

WebSocket communication in our application allows real-time interaction between the client and the server. canvAI Client
API is used to send requests to the CanvAI Core API for AI prediction. The message format is as follows:

```json
{
	"type": "message_type",
	"data": {
		"key": "value"
	}
}
```

### Message Types

1. **`handshake`** - This message type is used to establish a connection between the client and the server. Also it can
   be used to check if the server is running.

   #### Example Message

   ```json
   {
   	"type": "handshake"
   }
   ```

   #### Example Response

   ```json
   {
   	"type": "handshake",
   	"data": {
   		"status": "success"
   	}
   }
   ```

2. **`start`** - This message type is used to initialize the game. Duration is the time in seconds for which the game will run.

   #### Example Message

   ```json
   {
   	"type": "start",
   	"data": {
   		"duration": 60
   	}
   }
   ```

   #### Example Response

   ```json
   {
   	"type": "start",
   	"data": {
   		"image": "bed",
   		"message": "Game started! You have 60 seconds to draw the bed.",
   		"startEpoch": 1717229928515
   	}
   }
   ```

   #### Example Error Response

   ```json
   {
   	"type": "start",
   	"data": {
   		"status": "error",
   		"message": "Game already in progress"
   	}
   }
   ```

3. **`prediction`** - This message type is used to send the image data to the CanvAI Core API for prediction. The data
   should contain the base64 encoded image data.

   #### Example Message

   ```json
   {
   	"type": "prediction",
   	"data": {
   		"image_data": "base64_encoded_image"
   	}
   }
   ```

   ### Example Error Response

   If the game is started, the server will respond with an error message if the prediction is made after the game ends.

   ```json
   {
   	"type": "prediction",
   	"data": {
   		"status": "error",
   		"message": "Game not started yet"
   	}
   }
   ```

   #### Example Responses

   The server can respond with true prediction message or false prediction message. The false prediction message is sent
   when the prediction is not successful. Here are the examples of both responses:

   ##### False Prediction Response

   The drawing is classified as `bucket` but the game wanted user to draw something else.

   ```json
   {
   	"type": "prediction",
   	"data": {
   		"status": "success",
   		"prediction": "bucket",
   		"probability": 1,
   		"isPredicted": false
   	}
   }
   ```

   ##### True Prediction Response

   The drawing is classified as `bucket` and the game wanted user to draw the same.

   ```json
   {
   	"type": "prediction",
   	"data": {
   		"status": "success",
   		"prediction": "bucket",
   		"probability": 1,
   		"isPredicted": true,
   		"timeTaken": 4403,
   		"gainedScore": 61,
   		"nextImage": "book"
   	}
   }
   ```

   ##### Example Error Response

   ```json
   {
   	"type": "prediction",
   	"data": {
   		"status": "error",
   		"message": "Failed to predict, please try again."
   	}
   }
   ```

4. **`highscores`** - This message type is used to get the highscores of the game.

   #### Example Message

   ```json
   {
   	"type": "highscores"
   }
   ```

   #### Example Response

   ```json
   {
   	"type": "highscores",
   	"data": {
   		"highscores": [
   			{
   				"username": "user1",
   				"score": 61,
   				"date": "2024-04-01T12:00:00.000Z"
   			},
   			{
   				"username": "user2",
   				"score": 60,
   				"date": "2024-04-01T12:00:00.000Z"
   			},
   			{
   				"username": "user2",
   				"score": 60,
   				"date": "2024-04-01T12:00:00.000Z"
   			}
   		]
   	}
   }
   ```

### Response Types

#### Example Finish Response

This response is not sent after a request, but it is sent after the game ends. It contains the final score of the user.

```json
{
	"type": "finish",
	"data": {
		"message": "Game finished!",
		"score": 61
	}
}
```
