const TableName = process.env.TABLA_NAME;
const AWS = require('aws-sdk');
const { v4:uuid } = require("uuid");
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event)=>{
    const body = JSON.parse(event.body); //falta validar el body , solo parametros definidos
    const response = await savePet(body);
    
    return {
        statusCode:200,
        body: JSON.stringify({
            ok:true,
            body:"Registrado Correctamente"
        })
    }
}

async function savePet(pet){
    const params = {
        TableName,
        Item: {
            id:uuid(),
            ...pet
        }
    }
    return await DynamoDB.put(params).promise()
    .catch(e=>{throw new Error("Error :"+e)});
}

/*
    agregar mascota a empresa 
*/