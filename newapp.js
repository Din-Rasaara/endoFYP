var express = require('express')
var app = express()
var http = require("http").Server(app);
var bodyparser = require('body-parser')
var cors = require("cors");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }))
const mongoose = require("mongoose");
config = {
  DB: "mongodb://localhost:27017/testdb?replicaSet=rs",
};
mongoose.connect(config.DB, { useNewUrlParser: true }).then(
  () => {
    console.log("Database is connected");
  },
  (err) => {
    console.log("Can not connect to the database" + err);
  }
);
const db = mongoose.connection;
console.log("connected");

db.on("error", console.error.bind(console, "Connection Error:"));
const nameSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    age: Number,
    height: Number,
    weight: Number,
    gender: String,
    phone: Number,
    condition: String,
    comment: String},{collection:"testc"});
const User = mongoose.model("User", nameSchema);

app.listen(3000)

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/plots_page', function (req, res) {
  res.sendFile(__dirname + '/plots_page.html')
})

app.post('/plots_page', function (req, res) {
  console.log(req.body)
  //res.redirect('/plots_page')
  var myData = new User(req.body);
    myData.save()
        
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
      })


