const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000

//midlewere
app.use(express.json())
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://restaurant-management-37bf5.web.app",
    "https://restaurant-management-37bf5.firebaseapp.com",
  ],
  credentials: true,
}))
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.BD_PASSWORD}@cluster0.0zrlznh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



    // Get a handle to the database
    const database = client.db("Restaurant_Management");
    const products = database.collection("foods");
    const order = database.collection("order");
    const addToCard = database.collection("addToCard");

    //auth api
    app.post('/jwt', async (req, res) => {
      console.log(req.cookies)
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECTET, { expiresIn: '1h' })
      res.cookie('token', token, cookieOptions).send({ success: true })
    })

    // //clearing Token
    app.post("/logout", async (req, res) => {
      const email=req.body
      console.log('logOut user',email)
      res.clearCookie("token", {maxAge: 0 }).send({ success: true });
    });





    //services api
    app.get('/products', async (req, res) => {
      const result = await products.find().toArray()
      res.send(result);
    })
    app.get('/order/:email', async (req, res) => {
      const email = req.params.email
      const quary = { email: email }
      const result = await order.find(quary).toArray()
      res.send(result);
    })
    app.get('/addtocard/:email', async (req, res) => {
      const email = req.params.email;
      const quary = { email: email }
      const result = await addToCard.find(quary).toArray()
      res.send(result);
    })
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) }
      const result = await products.findOne(quary)
      res.send(result)
    })
    app.post('/myaddcart', async (req, res) => {
      const ids = req.body.map(id => new ObjectId(id)); // Convert string IDs to ObjectId instances
      const query = { _id: { $in: ids } };
      const result = await products.find(query).toArray();
      res.send(result);
    })


    app.post('/product', async (req, res) => {
      const newProduct = req.body;
      const result = await products.insertOne(newProduct);
      res.send(result);
    })
    app.post('/order', async (req, res) => {
      const orderDetails = req.body
      const result = await order.insertOne(orderDetails);
      res.send(result)
    })
    app.post('/addtocard', async (req, res) => {
      const addToCardDetails = req.body
      const result = await addToCard.insertOne(addToCardDetails);
      res.send(result)
    })


    app.put('/updatequantete/:id', async (req, res) => {
      const id = req.params.id;
      const updateqty = req.body
      const quary = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const doc = {
        $set: {
          Quantity: updateqty.Quantity
        },
      }
      const result = await products.updateOne(quary, doc, options)
      res.send(result)
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Resturant Management Server is Running')
})

app.listen(port, () => {
  console.log(`Resturant Management Server listening on port ${port}`)
})