/*const TableName = process.env.TABLA_NAME;
const AWS = require('aws-sdk');
const { v4:uuid } = require("uuid");
const DynamoDB = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();
const NEXT_STEP_LAMBDA = process.env.NEXT_STEP_LAMBDA;

function callNextStep(){
    if(NEXT_STEP_LAMBDA !== null && NEXT_STEP_LAMBDA !== undefined ){
        console.log("pasa el middleware");
        lambda.invoke({
            FunctionName:NEXT_STEP_LAMBDA,
            InvocationType: "Event"
        }, function(e, d){
            if(e){
                console.error("invocacion fallida",e);
            }
        });
    }
}*/
const ENTITY_TABLE = process.env.TABLA_NAME;
const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

exports.handler =  function(event, context, callback) {
    var token = event.authorizationToken;
    console.log(event);
    switch (token) {
        case 'allow':
            callback(null, generatePolicy('user', 'Allow', event.methodArn));
            break;
        case 'deny':
            callback(null, generatePolicy('user', 'Deny', event.methodArn));
            break;
        case 'unauthorized':
            callback("Unauthorized");   // Return a 401 Unauthorized response
            break;
        default:
            callback("Error: Invalid token"); // Return a 500 Invalid token response
    }
};

// Help function to generate an IAM policy
var generatePolicy = function(principalId, effect, resource) {
    var authResponse = {};
    
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; 
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; 
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        "stringKey": "stringval",
        "numberKey": 123,
        "booleanKey": true
    };
    return authResponse;
}