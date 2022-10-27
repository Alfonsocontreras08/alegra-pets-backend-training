const AWS = required("aws-sdk");
const TableNameEntity = process.env.TABLE_NAME_ENTITY;
const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event)=>{
    
    const data = await searchAll();
    return {
        statusCode:200,
        body:JSON.stringify({
            ok:true,
            Entitys:data.Items
        })
    }

} 

async function searchAll(){
    const params = {
        TableName: TableNameEntity
    }

    return await dynamoDB.scan(params).promise();
}