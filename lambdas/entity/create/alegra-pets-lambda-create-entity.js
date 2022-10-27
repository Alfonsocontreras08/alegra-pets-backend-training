const TableName = process.env.TABLA_NAME;
const S3BucketName = process.env.S3_Bucket_Name;
const REGION = process.env.REGION || "us-east-1";
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { "v4": uuid } = require('uuid');

const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event)=>{
    const body = JSON.stringify(event.body); //falta validar el body , solo parametros definidos
    await saveBodyS3();
    const response = await saveEntity(body);
    console.log(response);
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


async function saveBodyS3(body){
    try {
        const s3Client = new S3Client({ region: REGION });
        const bucketParams = {
          Bucket: S3BucketName,
          Key: `${new Date().toISOString()}-Create-entity.json`,
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

