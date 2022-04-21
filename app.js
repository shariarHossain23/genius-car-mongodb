const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mgnrg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run (){
    
    try{
        await client.connect()
        const database = client.db("geniuse-car").collection("service")

        // get service
        app.get('/service',async(req,res)=>{
            const query = {}
            const cursor =database.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

        // post data
        app.post('/service',async(req,res)=>{
            const newService = req.body
            const result = await database.insertOne(newService);
            res.send(result)
        })

        // delete user
        app.delete('/service/:id',async(req,res)=>{
            const id = req.params.id
            const query = {_id:ObjectId(id)}
            const deleteUser = await database.deleteOne(query)
            res.send(deleteUser)
        })
        // get particuller id
        app.get('/service/:id',async(req,res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const singleUser = await database.findOne(query)
            res.send(singleUser)
        })
    }
    finally{}
}
run().catch(console.dir);




app.listen(port,()=>{
    console.log("genius car service running");
})