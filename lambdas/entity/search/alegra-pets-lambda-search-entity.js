const AWS = require("aws-sdk");
const TableNameEntity = process.env.TABLA_NAME;
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event)=>{
    
    const data = await searchAll();
    
    if(!data.Items[0]){
        return {
            statusCode:400,
            body:JSON.stringify({
                ok:false,
                body:"No Existen Entidades Aun"
            })
        }
    }

    return {
        statusCode:200,
        body:JSON.stringify({
            ok:true,
            Entities:data.Items
        })
    }

} 

async function searchAll(){
    const params = {
        TableName: TableNameEntity
    }

    return await dynamoDB.scan(params).promise();
}