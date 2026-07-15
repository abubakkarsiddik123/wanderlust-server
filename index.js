const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
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

const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
  const authHeaders = req?.headers.authorization;
  if (!authHeaders) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeaders.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  console.log(token);
  try {
    const { payload } = await jwtVerify(token, JWKS);
    // console.log(payload);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token validation failed" });
  }
};

async function run() {
  try {
    // await client.connect();
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

    // middleWare token verify

    app.get("/destination/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await destinationCollection.findOne(query);
      res.send(result);
    });

    app.patch("/destination/:id", verifyToken,async (req, res) => {
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
    // booking system
    app.post("/booking", verifyToken, async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData);
      res.send(result);
    });

    app.get("/booking/:userId", verifyToken, async (req, res) => {
      const { userId } = req.params;
      const result = await bookingCollection.find({ userId: userId }).toArray();
      res.send(result);
    });

    app.delete("/booking/:bookingId", verifyToken, async (req, res) => {
      const { bookingId } = req.params;
      const query = {
        _id: new ObjectId(bookingId),
      };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
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
