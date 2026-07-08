const express = require("express");
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config();
const uri =process.env.MONGODB_URI;

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', async(req, res)=>{
    res.send('Server is runnign fine!')
})


async function run() {
  try {
    await client.connect();
    const db=client.db("wanderlust");
    const destinationCollection=db.collection("destinations");

    app.post("/destinations", async(req, res)=>{
      const destinationData = req.body;
      const result= await destinationCollection.insertOne(destinationData)
      res.send(result);

    })

    

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server runnign on port ${PORT}`);
});
