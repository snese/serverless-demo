'use strict';

var AWS = require('aws-sdk');
var uuid = require('uuid');

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'HC: Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

module.exports.addRating = (event, context, callback) => {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = JSON.parse(event.body);
  var Item = {
      id: uuid.v4(),
      beer: params.beer,
      rating: Number(params.rating)
  };

  docClient.put({TableName: 'slsbeer', Item: Item}, (error) => {
    if (error) {
      callback(error);
    }

    callback(null, {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
    });
  });
}

module.exports.getRating = (event, context, callback) => {
  var docClient = new AWS.DynamoDB.DocumentClient();

  var params = {
    TableName: 'slsbeer',
    FilterExpression : 'beer = :beer_name',
    ExpressionAttributeValues : {':beer_name' : event.queryStringParameters.beer}
  }

  docClient.scan(params, (error, data) => {
    if (error) {
      callback(error);
    }

    var sum = data.Items.reduce((accumulated, current) => {
      return accumulated + current.rating}
    , 0);

    var average = sum/data.Items.length;

    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ averageRating: average }),
    })

  });
}
