import "source-map-support/register";
import * as express from "express";
import * as AWS from "aws-sdk";
import * as uuid from "node-uuid";
import * as bodyParser from "body-parser";
import config from "./config.json";

// const config = require("./config.json");
const serverless = require("serverless-http");
const app = express();
const { "endpoint-prefix": prefix } = config;

const { TABLE_NAME, IS_OFFLINE } = process.env;

const dynamoDb =
  IS_OFFLINE === "true"
    ? new AWS.DynamoDB.DocumentClient({
        region: "localhost",
        endpoint: "http://localhost:8000"
      })
    : new AWS.DynamoDB.DocumentClient({
        region: "eu-west-2",
        endpoint: "dynamodb.eu-west-2.amazonaws.com"
      });

app.use(
  bodyParser.json({
    strict: false
  })
);

app.get(`/${prefix}`, (_req, res) => {
  const params = {
    TableName: TABLE_NAME
  };
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      return res.status(400).json({
        message: "Error retrieving Documents",
        error
      });
    }

    const { Items: docs } = result;
    return res.json({
      docs
    });
  });
});

app.get(`/${prefix}/:id`, (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: TABLE_NAME,
    Key: { id }
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      return res.status(400).json({ error: "Error retrieving Document" });
    }

    if (result.Item) {
      const doc = result.Item;
      return res.json(doc);
    } else {
      return res.status(404).json({ error: `Document with id: ${id} not found` });
    }
  });
});

app.post(`/${prefix}`, (req, res) => {
  const { prop = "default" } = req.body;
  const id = uuid.v4();
  const params = {
    TableName: TABLE_NAME,
    Item: {
      id,
      prop
    }
  };

  dynamoDb.put(params, error => {
    if (error) {
      console.log("Error creating Document", error);
      return res.status(400).json({ error: "Could not create Document" });
    }

    return res.json({ id, prop });
  });
});

app.put(`/${prefix}`, (req, res) => {
  const { id, prop } = req.body;
  var params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: "set prop = :p",
    ExpressionAttributeValues: { ":p": prop }
  };

  dynamoDb.update(params, error => {
    if (error) {
      console.log(`Error updating Document with id ${id}: `, error);
      return res.status(400).json({ error: "Could not update Document" });
    }

    return res.json({ id, prop });
  });
});

app.delete(`/${prefix}/:id`, (req, res) => {
  const { id } = req.params;
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id
    }
  };
  dynamoDb.delete(params, error => {
    if (error) {
      console.log(`Error deleting Document with id ${id}`, error);
      return res.status(400).json({ error: "Could not delete Document" });
    }

    return res.json({ success: true });
  });
});

export const handler = serverless(app);
