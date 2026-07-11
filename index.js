const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();
const uri = process.env.MONGODB_URI;

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", async (req, res) => {
  res.send("Server is runnign fine!");
});

async function run() {
  try {
    await client.connect();
    const db = client.db("wanderlust");
    const destinationCollection = db.collection("destinations");
    const bookingCollection = db.collection("bookings");

    app.get("/destination", async (req, res) => {
      const result = await destinationCollection.find().toArray();
      res.send(result);
    });

    app.post("/destinations", async (req, res) => {
      const destinationData = req.body;
      const result = await destinationCollection.insertOne(destinationData);
      res.send(result);
    });

    app.get("/destination/:id", async (req, res) => {
      const { id } = req.params;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await destinationCollection.findOne(query);
      res.send(result);
    });

    app.patch("/destination/:id", async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await destinationCollection.updateOne(query, {
        $set: updateData,
      });
      res.send(result);
    });

    app.delete("/destination/:id", async (req, res) => {
      const { id } = req.params;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await destinationCollection.deleteOne(query);
      res.send(result);
    });
    app.post("/booking", async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData);
      res.send(result);
    });

    app.get("/booking/:userId", async (req, res) => {
      const { userId } = req.params;
      const result = await bookingCollection.find({ userId: userId }).toArray();
      res.send(result);
    });

    app.delete("/booking/:bookingId", async (req, res) => {
      const { bookingId } = req.params;
      const query = {
        _id: new ObjectId(bookingId),
      };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server runnign on port ${PORT}`);
});
