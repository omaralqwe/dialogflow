
'use strict';
 
var https = require ('https');
const functions = require('firebase-functions');
const DialogFlowApp = require('actions-on-google').DialogFlowApp;

console.log('set me');
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  console.log('Inside Main function.....yessssssss');
  console.log('Request Headers: ' + JSON.stringify(request.headers));
  console.log('Request Body: ' + JSON.stringify(request.body));
  
  let action = request.body.queryResult.action;
  //const agent = new WebhookClient({ request, response });
  var chat = "here is a sample response: trump sucks";
  console.log('Inside Main function2');
  console.log(action);
  response.setHeader('Content-Type','applicaiton/json');
  
  if (action!= 'input.getStockPrice'){
      console.log('Inside input function');
  	response.send(buildChatResponse("I'm sorry, I don't know this"));
  	return;
  }

const parameters = request.body.queryResult.parameters;

var companyName = parameters['company_name'];
var priceType = parameters['price_type'];
var date = parameters ['date'];

getStockPrice (companyName, priceType, date, response);

});

function getStockPrice (companyName, priceType, date, CloudFnResponse) {

	console.log('In Function Get Stock Price');

	console.log("company name: " + companyName);
	console.log("price type: " + priceType);
	console.log("Date: " + date);


	var tickerMap = {
		"apple" : "AAPL",
		"microsoft" : "MSFT",
		"ibm" : "IBM",
		"google" : "GOOG",
		"facebook" : "FB",
		"snapchat" : "SNAP"
	};
	var priceMap = {
		"opening" : "open_price",
		"closing" : "close_price",
		"maximum" : "high_price",
		"high" : "high_price",
		"low" : "low_price",
		"minimum" : "low_price"
	};

	var stockTicker = tickerMap[companyName.toLowerCase()];
	var priceTypeCode = priceMap[priceType.toLowerCase()];
	console.log ('pricetypecode' + priceTypeCode);

	var pathString = "/historical_data?ticker=" + stockTicker + "&item=" + priceTypeCode +
	"&start_date=" + date +
	"&end_date=" + date;

	console.log ('path string:' + pathString);

	var username = "05b85e91bd9a4404f8922e3c1a2e32f0";
	var password = "60809e581fc0ac3d31316c8fc37a0368";

	var auth = "Basic " + new Buffer(username +":" + password).toString('base64');

	var request = https.get({
		host: "api.intrinio.com",
		path: pathString,
		headers: {
			"Authorization": auth
		}
	}, function (response) {
		var json = "";
		response.on('data', function(chunk) {
			console.log("received JSON response: " + chunk);
			json += chunk;

			
		});

		response.on('end', function(){
			var jsonData = JSON.parse(json);
			var stockPrice = jsonData.data[0].value;

			console.log ("the stock price received is:" + stockPrice);

			var chat = "The" + priceType + " price for " + companyName + 
			" on "  + date + " was " + stockPrice;

			CloudFnResponse.send(buildChatResponse(chat));

		});

});

}

function buildChatResponse(chat) {
	return JSON.stringify({"fulfillmentText": chat});
}