const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rdpmg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    const companyCollection = client
      .db("digitalDirectory")
      .collection("companyData");

    app.get("/company", async (req, res) => {
      const cursor = companyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get a single company data from db using  id
    app.get("/company/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await companyCollection.findOne(query);
      res.send(result);
    });

    //  get all products  filtering, sorting and pagination
    app.get("/category-filter", async (req, res) => {
      const { filter: alphabet, brand: category } = req.query;
      const query = {};

      if (alphabet) {
        query.company_name = { $regex: `^${alphabet}`, $options: "i" };
      }

      if (category) {
        query.category = category;
      }

      console.log("Query:", query);

      try {
        const companies = await companyCollection.find(query).toArray();
        res.status(200).json(companies);
      } catch (error) {
        res.status(500).json({ message: "Error fetching companies", error });
      }
    });

    //add Company info in db
    app.post("/add-company", async (req, res) => {
      const companyData = req.body;
      const result = await companyCollection.insertOne(companyData);
      res.send(result);
    });

    //Delete  data
    app.delete("/companyDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await companyCollection.deleteOne(query);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Digital Directory is running");
});

app.listen(port, () => {
  console.log(`Digital Directory is running on port: ${port}`);
});
