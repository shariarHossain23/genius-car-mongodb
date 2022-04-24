const express = require("express")
const cors = require("cors")
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { decode } = require("jsonwebtoken");
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())

function verifyJwt(req,res,next){
    const authHeader = req.headers. authorization
    if(!authHeader){
        return res.status(401).send({message:"unauthorized access"})
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_TOKEN_USER,(err,decoded)=>{
        if(err){
            return res.status(403).send({message:"forbidden access"})
        }
        console.log("decoded",decoded);
        req.decoded =decoded
        next()
    })
    
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mgnrg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run (){
    
    try{
        await client.connect()
        const database = client.db("geniuse-car").collection("service")
        const orderDatabase = client.db("geniusecar").collection("order")

        // get service
        app.get('/service',async(req,res)=>{
            const query = {}
            const cursor =database.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })


        // user token
        app.post('/login',async(req,res)=>{
            const user = req.body
            const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_USER,{
                expiresIn:('1d')
            })
            res.send(accessToken)
            
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

        // order collection
        app.get("/order",verifyJwt, async(req,res)=>{
            const decodedEmail = req.decoded.email
            const email = req.query.email
            if(email === decodedEmail){
                const query = {email : email}
                const cursor = orderDatabase.find(query)
                const result = await cursor.toArray()
                res.send(result)
            }
           else{
               res.status(403).send({error:"forbidden access"})
           }
        })

        // post
        app.post("/order",async(req,res)=>{
            const order = req.body
            const result = await orderDatabase.insertOne(order)
            res.send(result)
        })
    }
    finally{}
}
run().catch(console.dir);




app.listen(port,()=>{
    console.log("genius car service running");
})