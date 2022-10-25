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
    */
    const { petId, ColorEquals, raceEquals, nameEquals, typeOfPetEquals } = event.queryStringParameters || {petId:null, ColorEquals:null, raceEquals:null, nameEquals:null, typeOfPetEquals:null};
    let data;
    
    if(event.queryStringParameters===null){
        data = await searchAll();
    }else{
        if(petId){
            data = await searchById(petId);
        }else{
            data = await searchCustom({ ColorEquals, raceEquals, nameEquals, typeOfPetEquals });
        }
    }

    
    if(!data){
        
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
                body: {pets: data.Items}
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

async function searchCustom(custom){
    /*
    custom = { ColorEquals, raceEquals, nameEquals, typeOfPetEquals }
    */
    const {query, attributes } = makeQueryByParamsSended(custom);
    console.log(attributes);
    //console.log(ExpressionAttributeValuesParse(JSON.parse(attributes)));
    const params = {
        TableName,
        KeyConditionExpression: query,
        ExpressionAttributeValues: attributes
    }
    //console.log(params,"params");
    
    return await DynamoDB.query(params).promise()
    .catch(e=>{throw new Error("Error: "+e)});
}

function makeQueryByParamsSended(params){
    let query= "";
    let attributes =[];
    let name, race ,color,type; 
    
    const { ColorEquals, raceEquals, nameEquals, typeOfPetEquals } = params;
    if(ColorEquals!==null && ColorEquals!=="" && ColorEquals!==undefined){
        console.log('entra en color');
        query = sumQuery(query,"color",ColorEquals);
        attributes.push({":color":ColorEquals});
    }
    if(raceEquals!==null && raceEquals!=="" && raceEquals!==undefined){
        console.log('entra en rasa');
        query = sumQuery(query,"race",raceEquals);
        attributes.push({":race":raceEquals});
    }
    if(nameEquals!==null && nameEquals!==""  && nameEquals!==undefined){
        console.log('entra en nombre');
        query = sumQuery(query,"name",nameEquals);
        attributes.push({filter:":name",value:nameEquals});
    }
    if(typeOfPetEquals!==null && typeOfPetEquals!==""  && typeOfPetEquals!==undefined){
        console.log('entra en tipo');
        query = sumQuery(query,"type",typeOfPetEquals);
        attributes.push({filter:":type",value:typeOfPetEquals});
    }
    
    return {query,attributes};
}


function sumQuery(query,param,value){
    if(query==""){
        return query=`:${param} = ${value}`;
    }else{
        query+=`and :${param} = ${value}`;
    }
}


function ExpressionAttributeValuesParse(attr){
    let expressions ="";
    attr.foreach((a)=>{
        expressions+= `${a.filter} : ${a.value} ,`; 
    });
    
    return expressions;
}


/*
consultar mascota por id//
consultar mascotas de una fundacion
consultar todas las mascotas de una fundacion

*/