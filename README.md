# Serverless Meme Generator - Local Development

## Prerequisites

- Node.js installed
- Serverless Framework installed (`npm install -g serverless`)

## Starting the Project Locally

To run the project locally using serverless-offline, use the following command:

```bash
serverless offline start --reloadHandler
```

This command:

- Starts a local API Gateway emulator
- Enables hot reloading for Lambda functions
- Watches for changes in your handler files
- Automatically restarts the service when changes are detected

The API will be available at `http://localhost:3000` by default.

## Development Notes

- Any changes to your Lambda functions will trigger automatic reload
- Check the console for endpoint URLs and port information
- Use `Ctrl+C` to stop the local server

## Using the API

- `GET /` : Get the front HTML page to easily generate your memes

- `POST /generate` : Generate the image given JSON instructions (detailed after). Return a `key` linked to the corresponding generated image. Use your `key` on the `/download` route to retrieve your image.

To send your image and text to the server, you will need for the request body to follow this JSON format :

```js
{
    bgImgUrl: "The URL to your templatte image",
    topText: "The text that will appear at the top of the image",
    bottomText: "The text that will appear at the bottom of the image",
}
```

- `GET /download/{key}` : Retrieve your image using the `key` you obtained earlier.
