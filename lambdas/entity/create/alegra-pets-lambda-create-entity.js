const TableName = process.env.TABLA_NAME;
const AWS = require('aws-sdk');
const { v4:uuid } = require("/opt/nodejs/custom");

const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event)=>{
    const body = JSON.parse(event.body); //falta validar el body , solo parametros definidos
    await saveEntity(body);

    return {
        statusCode:200,
        body: JSON.stringify({
            ok:true,
            body:"Registrado Correctamente"
        })
    }
}

async function saveEntity(entity){
    const params = {
        TableName,
        Item: {
            id:uuid(),
            ...entity
        },
    }
    return await DynamoDB.put(params).promise()
    
}