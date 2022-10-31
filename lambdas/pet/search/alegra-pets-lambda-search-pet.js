const TableName = process.env.TABLA_NAME;
const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();
var params = [];

exports.handler = async (event)=>{
    /*
    * petId=
    * ColorEquals=
    * raceEquals=
    * nameEquals=
    * typeOfPetEquals=
    * entityOwnerEquals=
    */
    const { petId } = event.queryStringParameters|| { petId:null };
    let data;
    
    if(event.queryStringParameters===null){
        data = await searchAll();
    }else{
        if(petId){
            data = await searchById(petId);
        }else{
            //data = await searchCustom({ ColorEquals, raceEquals, nameEquals, typeOfPetEquals });
            data = await searchCustom2(event.queryStringParameters);
        }
    }

    
    if(!data.Items[0]){
        
        data = "No se Encontraron Resultados con los parametros ingresados"
        
        return {
            statusCode:404,
            body: JSON.stringify({
                ok:false,
                body: data
            })
        }
    }else{
        return {
            statusCode:200,
            body: JSON.stringify({
                ok:true,
                body:{pets: (data.Items != undefined)?data.Items:data  }
            })
        }    
    }
    
}


async function searchAll(){
    const params = {
        TableName,
    }
    return await DynamoDB.scan(params).promise()
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

async function searchCustom2(queryParams){
    const { ColorEquals, raceEquals, nameEquals, typeOfPetEquals, entityOwnerEquals } = queryParams;
    let data = (await searchAll()).Items;
    
    console.log(ColorEquals, raceEquals, nameEquals, typeOfPetEquals, entityOwnerEquals);
    if(ColorEquals!==null && ColorEquals!=="" && ColorEquals!==undefined){
       data = searchInObject(data,"color",ColorEquals);
    }
    if(raceEquals!==null && raceEquals!=="" && raceEquals!==undefined){
        data = searchInObject(data,"race",raceEquals);
    }
    if(nameEquals!==null && nameEquals!==""  && nameEquals!==undefined){
       data = searchInObject(data,"name",nameEquals);
    }
    if(typeOfPetEquals!==null && typeOfPetEquals!==""  && typeOfPetEquals!==undefined){
        data = searchInObject(data,"typePet",typeOfPetEquals);

    }if(entityOwnerEquals!==null && entityOwnerEquals!==""  && entityOwnerEquals!==undefined){
        data = searchInObject(data,"entity_owner",entityOwnerEquals);
    }
    
    return { Items:data };
}

function searchInObject(obj,param,value){
    return obj.filter((e)=>{
        if(e[param] == value){
            console.log('coincide',e);
            return e;
        }
    });
}


/*
consultar mascota por id//
consultar mascotas de una fundacion
consultar todas las mascotas de una fundacion

*/