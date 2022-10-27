const AWS = require("aws-sdk");
const TableNameEntity = process.env.TABLA_NAME;
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event)=>{
    
    const data = await searchAll();
  
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