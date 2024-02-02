const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://blood-donation-binary-avengers.vercel.app",
    ],
  })
);
app.use(express.json());

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.fycfdwn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const userCollection = client.db("bloodDonation").collection("users");
    const postCollection = client.db("bloodDonation").collection("posts");
    const requestCollection = client.db("bloodDonation").collection("request");

    /*==================== user related api ============================*/
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const exitingUser = await userCollection.findOne(query);
      if (exitingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // get all user from database
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    /*  single user */
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email: email });
      res.send(result);
    });

    // delete user from database
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    /*==================== Post related api ============================*/

    app.post("/posts", async (req, res) => {
      const posts = req.body;
      const result = await postCollection.insertOne(posts);
      res.send(result);
    });

    app.get("/posts", async (req, res) => {
      const posts = await postCollection.find().toArray();
      res.send(posts);
    });

    app.get("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = await postCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(cursor);
    });

    app.put("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatePost = req.body;
      console.log(updatePost);
      const post = {
        $set: {
          likes: updatePost.newLikes,
        },
      };
      const result = await postCollection.updateOne(filter, post, options);
      console.log(result);
      console.log("its", updatePost.likes);
      res.send(result);
    });

    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// server runnig
app.get("/", (req, res) => {
  res.send("Blood Donation servier is running");
});
app.listen(port, () => {
  console.log("server runnig at port", port);
});
