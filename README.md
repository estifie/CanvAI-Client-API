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

1. **`predict`** - This message type is used to send the image data to the CanvAI Core API for prediction. The data
   should contain the base64 encoded image data.

   #### Example Message

   ```json
   {
   	"type": "predict",
   	"data": {
   		"image_data": "base64_encoded_image"
   	}
   }
   ```

   #### Example Response

   ```json
   {
   	"type": "prediction",
   	"data": {
   		"status": "success",
   		"prediction": "airplane",
   		"probability": 0.99
   	}
   }
   ```

   ```json
   {
   	"type": "prediction",
   	"data": {
   		"status": "error",
   		"message": "Failed to predict, please try again."
   	}
   }
   ```
