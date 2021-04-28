const { ObjectId } = require('bson');
const express = require('express');
const app = express();
var mongoose = require("mongoose");
var cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3000 ;

app.use(express.static(__dirname + "/public/"));
app.use(express.json());
app.use(cors());

app.use(express.urlencoded({
  extended: true
}));

//Connect to the database
mongoose.connect( process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

var db = mongoose.connection;

// Making sure the connection is working
db.on("error", function(){
  console.log("Connection error!")
});

db.once("open", function() {
  console.log("Connection successful!");
});

// website routing

app.get('/', (req, res) => {
  res.sendFile( __dirname + "/public/index.html");
});

// making a schema
const Dinosaur = mongoose.model(
 "Dinosaur",
  {
    dino: String,
    info: String
  },
  // name of collection
  "Dinosaurs_info"
);

// api routing

app.get("/api/getall", async (req, res) => {

  const results = await Dinosaur.find({});
  
    // console.log(results);
    res.status(200).json(results);
});

app.get("/api/get/:searchword", async (req,res) => {

  // save the searchword into a variable
  let searchword = req.params.searchword
  
  const results = await Dinosaur.find({ dino: { $regex: searchword, $options: 'i' } })

  // console.log(results);
  res.status(200).json(results);
})

app.post("/api/add", (req, res) => {

  // getting the values given in postman
  const dino = req.body.dino;
  const info = req.body.info;

  const dinosaur = new Dinosaur({
    dino: dino,
    info: info
  })
  res.status(200).json(dinosaur)
  dinosaur.save();

});

app.put("/api/update/:id", async (req, res) => {

  let id = req.params.id;

  let update = {
    dino: req.body.dino,
    info : req.body.info
  };

  let options = { new: true };

  let result = await Dinosaur.findByIdAndUpdate(id, update, options);

  res.status(200).json(result);

})

app.delete("/api/delete/:id", async (req, res) => {

  let id = req.params.id;

  let result = await Dinosaur.findByIdAndDelete(id, function(err, results) {
    if (err) console.log(err);

    res.status(200).json(results);

  });
  
})

app.listen(PORT);
