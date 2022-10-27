const TablePet = process.env.TABLA_NAME_PET;
const TableEntity = process.env.TABLA_NAME_ENTITY;
const S3BucketName = process.env.S3_Bucket_Name;
const REGION = process.env.REGION || "us-east-1";
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const AWS = require('aws-sdk');
const { v4:uuid } = require("uuid");
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event)=>{
    const body = JSON.parse(event.body); 
    const data = await searchEntity(body.entity_owner);
    if(data.Items.length==0){
        return {
            statusCode:400,
            body:JSON.stringify({
                ok:false,
                body:"La Entidad No Se Encuentra Registrada"
            })
        }
    }
    await saveBodyS3(body);
    await savePet(body);
    
    return {
        statusCode:200,
        body: JSON.stringify({
            ok:true,
            body:"Registrado Correctamente"
        })
    }
}

async function savePet(pet){
    const { state, ...obj} = pet;
    const params = {
        TableName:TablePet,
        Item: {
            id:uuid(),
            ...obj,
            "state":"Sad"
        }
    }
    return await DynamoDB.put(params).promise()
    .catch(e=>{throw new Error("Error :"+e)});
}

async function saveBodyS3(body){
    try {
        const s3Client = new S3Client({ region: REGION });
        const bucketParams = {
          Bucket: S3BucketName,
          Key: `${new Date().toISOString()}-create-pet.json`,
          Body: JSON.stringify(body),
        }
        
        const data = await s3Client.send(new PutObjectCommand(bucketParams));
        console.log(
          "Successfully uploaded object: " +
            bucketParams.Bucket +
            "/" +
            bucketParams.Key
        );
        return data;
    } catch (e) {
        throw Error("error, no se pudo guardar el body en s3: ",e.message);
   }
    
}

async function searchEntity(entityId){
    
    const params = {
        TableName:TableEntity,
        KeyConditionExpression: 'id = :petId ',
        ExpressionAttributeValues: {
            ':petId': entityId
        }
    }
    console.log(params,"params searchById");
    return await DynamoDB.query(params).promise()
    .catch(e=>{throw new Error("Error: "+e)});

}

/*
    agregar mascota a empresa 
*/