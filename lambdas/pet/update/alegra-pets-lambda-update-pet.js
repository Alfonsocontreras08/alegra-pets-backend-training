const TablePet = process.env.TABLA_NAME_PET;
const TableEntity = process.env.TABLA_NAME_ENTITY;
const S3BucketName = process.env.S3_Bucket_Name;
const REGION = process.env.REGION || "us-east-1";
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event)=>{
    const body = JSON.parse(event.body); //falta validar el body , solo parametros definidos
    const {petId} = event.pathParameters; 
    const entity = await searchEntity(body.entity_owner);
    if(entity.Items.length==0){
        return {
            statusCode:400,
            body:JSON.stringify({
                ok:false,
                body:"La Entidad No Se Encuentra Registrada"
            })
        }
    }


    const pet = await searchPet(petId)
    if(pet.Items.length==0){
        return {
            statusCode:400,
            body:JSON.stringify({
                ok:false,
                body:"El Animal No Existe"
            })
        }
    }
    await saveBodyS3(body);
    await updatePet(body,petId);
    
    return {
        statusCode:200,
        body: JSON.stringify({
            ok:true,
            body:"Actualizado Correctamente"
        })
    }
}

async function updatePet(pet,petId){
    const { state,id, ...obj} = pet;
    const params = {
        TableName: TablePet,
        Key: { "id": petId },
        UpdateExpression: "set race = :race, typePet = :type, #name_pet = :name, color = :color",
        ExpressionAttributeNames: { "#name_pet": "name" },
        ExpressionAttributeValues: {
            ":race": pet.race,
            ":type": pet.typePet,
            ":name": pet.name,
            ":color": pet.color
        }
    };

    return await DynamoDB.update(params).promise()
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
