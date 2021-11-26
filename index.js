const express = require("express");
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.muk27.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



app.get("/", (req, res) => {
  console.log("Node is working perfectly");
  res.send("Node server is working");
});

// database connection and manage data
const runServer = async () => {
  try{
    await client.connect();
    const database = client.db("vacationBooking");
    const roomsCollection = database.collection("rooms");
    const bookingCollection = database.collection("booking");

    
    // const result = await roomsCollection.insertOne(data);
    
    // load all data
    app.get('/rooms', async (req, res) => {
      const rooms = await roomsCollection.find({}).sort({_id:-1}).toArray();      
      res.json(rooms);
    });

    // load a single room for details
    app.get("/roomdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await roomsCollection.findOne(query);
      res.json(result);
    });


    // Booking a room
    app.post("/booking", async (req, res)=> {
      const bookInfo = req.body;
      const result = await bookingCollection.insertOne(bookInfo);
      // console.log("hitting the post api", bookInfo);
      res.json(result);
    });

    // Booking load
    app.get("/booking", async (req, res)=> {
        const result = await bookingCollection.find({}).toArray();
        // console.log(result);
        res.json(result);
    });

    // find and load my booking rooms
    app.get('/manage-booking', async (req, res) => {
        const allBooked = await bookingCollection.find({}).toArray();
        const bookedIds = [];
        allBooked.map(bb => bookedIds.push(bb.serviceId));
        const query = {id : {$in : bookedIds}};
        const result = await roomsCollection.find(query).toArray();
        // console.log(bookedIds, query);
        res.json(result);
    });


    // manage add new service
    app.post("/addnew", async (req, res) => {
      const newRoom = req.body;
      const result = await roomsCollection.insertOne(newRoom);
      res.json(result);
    });

    // Delete Operation
    app.delete("/manage/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id : ObjectId(id)};
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });


    // update booking
    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id : ObjectId(id)};
      const result = await bookingCollection.findOne(query);
      console.log(id, result)
      res.json(result)
    })
    app.put("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const filter = {_id : ObjectId(id)};
      const updateDoc = {
        $set: {
          name : updateData.name,
          email: updateData.email,
          phone: updateData.phone,
          guest: updateData.guest,
          days: updateData.days,
          Adults: updateData.Adults
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc)
      console.log(id, updateData)
      res.json(result)
    });

    // update Status
    app.put("/status/:id", async (req, res) => {
      const id = (req.params.id);
      const status = req.body;
      const filter = {_id : ObjectId(id)};
      const updateDoc = {
        $set: {
          status : status.status,
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc)
      res.json(result);
    })

  }finally{
    // await client.close()
  }
};
runServer().catch(console.dir);


app.listen(port, ()=>{
  console.log("server is running on ", port)
})