const TableName = process.env.TABLA_NAME;
const AWS = require('aws-sdk');
//const { v4:uuid } = require("uuid");
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event)=>{
    const {petId} = event.pathParameters; //falta validar el body , solo parametros definidos
   
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


/*
 *  eliminar mascota 
*/