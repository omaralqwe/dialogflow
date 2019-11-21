// See github project... tbd

'use strict';
var https = require ('https');

const functions = require('firebase-functions');
const {dialogFlow} = require('actions-on-google'); 

console.log('set me');

const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body)); 
    
    //let action = request.body.queryResult.action;
    console.log('Inside Main function2');
    //console.log(action);
    response.setHeader('Content-Type','applicaiton/json');

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('read records', readRecords);
    //intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);

   function fallback(agent) {
    console.log('Identified fallbak intent');
    response.send(buildChatResponse("I'm sorry, I don't know this"));
    return;
    }
    
    function welcome(agent) {
    console.log('Identified welcome intent');
        response.send(buildChatResponse("Welcome to your Salesforce Agent, I'm here to help you"));
        return;
        }

    function readRecords(agent) {
        console.log('Identified read records intent');
        const parameters = request.body.queryResult.parameters;
        var dataType = parameters['dataType'];
        console.log('dataType log ' + dataType);
        getRecords (dataType, response);
    }

});

function getRecords (dataType, CloudFnResponse) {
    console.log('In Function getRecords');
    console.log('dataType log ' + dataType);

    //set the header for authorization and content type
    var auth = "Bearer 00D4J0000002Hbc!AR0AQDy5PNRJd4rbyagrF.jKAuRT2Go2w0J9fGc5WtS3i.l_a1WGOyu0PZWOEE17Wvf3EHdil5qBdjhZTn3LF002XZhQyofc";
    var contentHeader = "application/json";

    var request = https.get({
		host: "https://um5.salesforce.com/services/apexrest/Account/Request/GET",
		//path: pathString,
		headers: {
            "Content-Type": contentHeader,
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
			var customerName = jsonData.data[0].name;

			console.log ("the customer name received is:" + customerName);

			var chat = "The customer retrieved is called " + customerName;

			CloudFnResponse.send(buildChatResponse(chat));

		});
			
	});

}
function buildChatResponse(chat) {
	return JSON.stringify({"fulfillmentText": chat});
}