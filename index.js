const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
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
    const donnetedCollection = client
      .db("bloodDonation")
      .collection("donneted");
    const postCollection = client.db("bloodDonation").collection("posts");
    const requestCollection = client.db("bloodDonation").collection("request");
    const commentCollection = client.db("bloodDonation").collection("comments");
    const campaignCollection = client
      .db("bloodDonation")
      .collection("campaign");

    /*==================== Socket.IO setup ============================*/
    const server = http.createServer(app);
    const io = socketIO(server);

    io.on("connection", (socketIO) => {
      console.log("socket connection..");

      socketIO.on("disconnect", () => {
        console.log(" socket disconnect");
      });
    });

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

    // user update api
    app.put("/users/:_id", async (req, res) => {
      const id = req.params._id;
      const user = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateUser = {
        $set: {
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          address: user.address,
          blood: user.blood,
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updateUser,
        options
      );
      res.send(result);
    });

    // delete user from database
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/user-all", async (req, res) => {
      try {
        const result = await userCollection.deleteMany({});
        res.send(result);
      } catch (error) {
        console.error("Error deleting requests:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    /*==================== user related api ============================*/

    /*==================== requests related api ============================*/

    /*related post api api*/
    app.post("/requests", async (req, res) => {
      const user = req.body;
      const result = await requestCollection.insertOne(user);
      res.send(result);
    });

    app.get("/requests", async (req, res) => {
      const result = await requestCollection.find().toArray();
      res.send(result);
    });

    /*  delete request from database */
    app.delete("/requests/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestCollection.deleteOne(query);
      res.send(result);
    });

    /* delete all requests from database */
    app.delete("/requests-all", async (req, res) => {
      try {
        const result = await requestCollection.deleteMany({});
        res.send(result);
      } catch (error) {
        console.error("Error deleting requests:", error);
        res.status(500).send("Internal Server Error");
      }
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

    /*==================== comments related api ============================*/

    app.post("/comments", async (req, res) => {
      const comments = req.body;
      const result = await commentCollection.insertOne(comments);
      res.send(result);
    });

    app.get("/comments", async (req, res) => {
      const comments = await commentCollection.find().toArray();
      res.send(comments);
    });

    app.get("/comments/:commentID", async (req, res) => {
      const commentID = req.params.commentID;
      const cursor = commentCollection.find({ commentID: commentID });
      const result = await cursor.toArray();
      res.send(result);
    });

    /*================== campaign related api ++++++++++++++++++++++++++++++++*/

    app.post("/campaign", async (req, res) => {
      const campaign = req.body;
      const result = await campaignCollection.insertOne(campaign);
      res.send(result);
    });

    app.get("/campaign", async (req, res) => {
      const campaign = await campaignCollection.find().toArray();
      res.send(campaign);
    });

    /*================== Doneted related api ++++++++++++++++++++++++++++++++*/

    /* donete post */
    app.post("/doneted", async (req, res) => {
      const team = req.body;
      const { userId } = team;
      const query = { _id: new ObjectId(userId) };
      const result = await donnetedCollection.insertOne(team);
      const updateStatus = {
        $set: {
          status: "processing",
        },
      };
      await requestCollection.updateOne(query, updateStatus);
      res.send(result);
      ``;
    });

    /* donete get */
    app.get("/doneted", async (req, res) => {
      const doneted = await donnetedCollection.find().toArray();
      res.send(doneted);
    });

    /* donete delete */
    app.delete("/doneted/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await donnetedCollection.deleteOne(query);
      res.send(result);
    });

    /*==================== Socket server ============================*/
    io.on("connection", (socket) => {
      console.log("socket connection..");
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
