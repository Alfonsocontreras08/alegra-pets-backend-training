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
            //data = await searchCustom({ ColorEquals, raceEquals, nameEquals, typeOfPetEquals });
            data = await searchCustom2({ ColorEquals, raceEquals, nameEquals, typeOfPetEquals });
            
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
    const { ColorEquals, raceEquals, nameEquals, typeOfPetEquals } = queryParams;
    let data = (await searchAll()).Items;
    
    if(ColorEquals!==null && ColorEquals!=="" && ColorEquals!==undefined){
       data = searchInObject(data,"color",ColorEquals);
       console.log(data,"despues de color");
    }
    if(raceEquals!==null && raceEquals!=="" && raceEquals!==undefined){
        data = searchInObject(data,"race",raceEquals);
    }
    if(nameEquals!==null && nameEquals!==""  && nameEquals!==undefined){
       data = searchInObject(data,"name",nameEquals);
    }
    if(typeOfPetEquals!==null && typeOfPetEquals!==""  && typeOfPetEquals!==undefined){
        data = searchInObject(data,"type",typeOfPetEquals);
    }
    
    return data;
}

function searchInObject(obj,param,value){
    return obj.filter((e)=>{
        if(e[param] == value){
            return e;
        }
    });
}












async function searchCustom(custom){
    const {query, attributes } = makeQueryByParamsSended(custom);
    
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

/*function makeQueryByParamsSended(params){
    let query= "";
    let attribute ="";
    
    const { ColorEquals, raceEquals, nameEquals, typeOfPetEquals } = params; //cambiar esto por un switch case
    if(ColorEquals!==null && ColorEquals!=="" && ColorEquals!==undefined){
        query = sumQuery(query,"color",ColorEquals);
        attribute = sumParams(attribute,"color",ColorEquals);
    }
    if(raceEquals!==null && raceEquals!=="" && raceEquals!==undefined){
        query = sumQuery(query,"race",raceEquals);
        attribute = sumParams(attribute,"race",raceEquals);
    }
    if(nameEquals!==null && nameEquals!==""  && nameEquals!==undefined){
        query = sumQuery(query,"name",nameEquals);
        attribute = sumParams(attribute,"name",nameEquals);
    }
    if(typeOfPetEquals!==null && typeOfPetEquals!==""  && typeOfPetEquals!==undefined){
        query = sumQuery(query,"type",typeOfPetEquals);
        attribute = sumParams(attribute,"type",typeOfPetEquals);
    }
    console.log(attribute.split(","),"attribute");
    
    return {query,attribute};
}


function sumQuery(query,param,value){
    if(query==""){
        query=`:${param} = ${value}`;
    }else{
        query+=`and :${param} = ${value}`;
    }
    return query;
}

function sumParams(param, filter,value){ /*se que no se debe hacer asi pero no se como mas pasar parametros opcionales en una consulta de dynamo*//*
    if(param==""){                      // es esto o traer todos los campos y filtrarlos con el backend.
        param = `':${filter}': '${value}' `;
    }else{
        param += `, ':${filter}':'${value}'`;
    }
    return param;
}

function ExpressionAttributeValuesParse(attr){
    let expressions ="";
    attr.foreach((a)=>{
        expressions+= `${a.filter} : ${a.value} ,`; 
    });
    
    return expressions;
}*/


/*
consultar mascota por id//
consultar mascotas de una fundacion
consultar todas las mascotas de una fundacion

*/