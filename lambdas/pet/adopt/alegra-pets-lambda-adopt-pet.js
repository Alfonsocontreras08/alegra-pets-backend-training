const TablePet = process.env.TABLA_NAME_PET;
const TableEntity = process.env.TABLA_NAME_ENTITY;
const TopicArnSns = process.env.TOPIC_ARN_SNS;

const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();
const AWS_SNS = new AWS.SNS({apiVersion: '2010-03-31'});



exports.handler = async (event)=>{
    const body = JSON.parse(event.body); 
    const { petId } = event.pathParameters; 
 
    try {
        const entity = await checkEntity(body.entity_adopt);
        
        if(entity.Items.length==0){
            return response(401,false,"No Existe la Entidad");
        }else if ( entity.Items[0].type!="user" ){
            console.log(entity.Items);
            return response(401,false,"Solo Los Usuarios Pueden Adoptar Mascotas");
        }
        
    
    
        const pet = await searchPet(petId)
        if(pet.Items.length==0){
            return response(400,false,"El Animal No Existe");
        }
        
        await adoptPet(petId);
        return response(200,true,"Mascota Adoptada Correctamente");
        
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body:error
        }
    }
    
}

async function adoptPet(petId){
    const params = {
        TableName: TablePet,
        Key: { "id": petId },
        UpdateExpression: "set #state = :status",
        ExpressionAttributeNames: { "#state": "state" },
        ExpressionAttributeValues: {
            ":status": "Happy",
        },
        ReturnValues: "ALL_NEW"
    };

    const pet = await DynamoDB.update(params).promise()
    .catch(e=>{throw new Error("Error :"+e)});
    
    await EmailNotification(pet.Attributes);
}

async function checkEntity(entityId){
    const params = {
        TableName:TableEntity,
        KeyConditionExpression: 'id = :entityId ',
        ExpressionAttributeValues: {
            ':entityId': entityId
        }
    }
    return await DynamoDB.query(params).promise()
    .catch(e=>{throw new Error("Error: "+e)});
}

async function searchPet(petId){
    
    const params = {
        TableName:TablePet,
        KeyConditionExpression: 'id = :petId ',
        ExpressionAttributeValues: {
            ':petId': petId
        }
    }
    return await DynamoDB.query(params).promise()
    .catch(e=>{throw new Error("Error: "+e)});

}

const response = (status,ok,body)=>{
    return {
        statusCode:status,
        body:JSON.stringify({
            ok,
            body
        })
    }
}

async function EmailNotification(pet){
    try{
        const params = {
            Message: `hola, la mascota ${pet.name} de rasa: ${pet.race} fue adoptada.`,
            TopicArn:TopicArnSns
        };
    
        return await AWS_SNS.publish(params).promise();
    }catch(error){
        console.log(error);
    }
}