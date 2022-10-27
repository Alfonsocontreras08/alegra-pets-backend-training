const S3BucketName = process.env.S3_Bucket_Name;
const REGION = process.env.REGION || "us-east-1";
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");






exports.handler = async (event)=>{
    const body = JSON.parse(event.body);
    saveBodyS3(body);

    return {
        statusCode:200,
        "body":{
            ok:true,
            msj:"todo Perfecto"
        }
    }
}

async function saveBodyS3(body){
    try {
        const s3Client = new S3Client({ region: REGION });
        const bucketParams = {
          Bucket: S3BucketName,
          Key: `${new Date().toISOString()}-update-entity.json`,
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

async function saveBodyS3(body){
    try {
        const s3Client = new S3Client({ region: REGION });
        const bucketParams = {
          Bucket: S3BucketName,
          Key: `${new Date().toISOString()}-create-entity.json`,
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
/**
    actualizar mascota,
 */