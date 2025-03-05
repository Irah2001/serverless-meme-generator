const { createCanvas, loadImage } = require('canvas');
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const dynamoDb = new AWS.DynamoDB.DocumentClient(
  process.env.IS_OFFLINE && {
    region: "localhost",
    endpoint: "http://localhost:8000",
    accessKeyId: 'xxxx',
    secretAccessKey: 'xxxx',
  }
);

const TABLE_NAME = process.env.DYNAMODB_TABLE;

exports.index = async (event) => {
  try {
    const filePath = path.join(__dirname, "public", "index.html");
    const htmlContent = fs.readFileSync(filePath, "utf-8");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
      },
      body: htmlContent,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "Erreur lors du chargement de la page HTML",
    };
  }
};

exports.generateMeme = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { topText, bottomText, bgImgUrl } = body;
    const width = 500;
    const height = 500;
    const bgImg = await loadImage(bgImgUrl);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(bgImg, 0, 0, width, height);

    // Style
    ctx.font = '64px sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Textes
    ctx.fillText(topText, width / 2, 60);
    ctx.fillText(bottomText, width / 2, height - 60);

    const key = uuidv4().slice(0, 8);
    const buffer = canvas.toBuffer('image/png');

    const params = {
      TableName: TABLE_NAME,
      Item: {
        key,
        topText,
        bottomText,
        image: buffer,
        createdAt: new Date().toISOString()
      }
    };
    await dynamoDb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Meme generated and saved successfully in DynamoDB',
        key,
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error generating meme', error: error.message })
    };
  }
};

exports.downloadMeme = async (event) => {
  const { key } = event.pathParameters;
  const params = {
    TableName: TABLE_NAME,
    Key: {
      key,
    }
  };

  const { Item } = await dynamoDb.get(params).promise();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="meme.png"'
    },
    body: Item.image.toString('base64'),
    isBase64Encoded: true
  };
};
