const TableName = process.env.TABLA_NAME;
const AWS = require('aws-sdk');
//const { v4:uuid } = require("uuid");
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event)=>{
    const {petId} = event.pathParameters; //falta validar el body , solo parametros definidos
    const data = await searchById(petId);

    if(!data.Items){
        return {
            statusCode:404,
            body: JSON.stringify({
                ok:false,
                body:"Elemento No Encontrado"
            })
        }
    }

    const response = await DeletePet(petId);
    console.log(response);
    return {
        statusCode:200,
        body: JSON.stringify({
            ok:true,
            body:"Eliminado Correctamente"
        })
    }
}

async function DeletePet(petId){
    const params = {
        TableName,
        Key: {"id":petId}
    }
    return await DynamoDB.delete(params,
    function(err,data){
        console.log(err,"err");
        console.log(data,"data");
    }).promise()
    .catch(e=>{throw new Error("Error: "+e)});
}

async function searchById(petId){
    const params = {
        TableName,
        KeyConditionExpression: 'id = :petId ',
        ExpressionAttributeValues: {
            ':petId': petId
        }
    }
    console.log(params,"params searchById");
    return await DynamoDB.query(params).promise()
    .catch(e=>{throw new Error("Error: "+e)});
}

/*
 *  eliminar mascota 
*/