const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config()
const port = process.env.PORT || 5000;

// middleware  
app.use(cors());
app.use(express.json());

// mongodb-connection 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.fycfdwn.mongodb.net/?retryWrites=true&w=majority`



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const userCollection = client.db("bloodDonation").collection("users");
    const postCollection = client.db("bloodDonation").collection("posts");
    const requestCollection = client.db("bloodDonation").collection("request");


    // get all user from database 
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const users = req.body;
      const result = await userCollection.insertOne(users);
      res.send(result);
    });
    // get all post from database 
    app.get('/posts', async (req, res) => {
      const result = await postCollection.find().toArray()
      res.send(result)
    })

    app.post('/posts', async (req, res) => {
      const users = req.body;
      const result = await postCollection.insertOne(users);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);;


// server runnig
app.get('/', (req, res) => {
  res.send('user mangement is on')
})
app.listen(port, () => {
  console.log('server runnig at port', port);
})