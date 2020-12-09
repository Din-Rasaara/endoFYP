var app = require("express")();
var http = require("http").Server(app);
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//mongoose.connect('mongodb://localhost/testdb');
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

var io = require("socket.io");
var server = require("http").createServer(app);

var socket = io(server)
//create an event listener
//To listen to messages
socket.on("connection", (client) => {
  console.log("user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

db.once("open", () => {
  server.listen(3000, () => {
    console.log("listening on *:3000");
  });
  
  const taskCollection = db.collection("testc");
  const changeStream = taskCollection.watch();

  changeStream.on("change", (change) => {
    console.log(change);
    if(change.operationType==="insert"){
      socket.emit("server",change.fullDocument);
      //console.log(change.fullDocument);
    }
    if (change.operationType === "update") {
      socket.emit("server", change.updateDescription);
      console.log(change.updateDescription);
      
    }
  });
});

app.get('/form', function (req, res) {
  res.sendFile(__dirname + '/form.html')
})

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/plots_page.html");
});

app.get("/results", function (req, res) {
  res.sendFile(__dirname + "/results.html");
});

app.post('/patient-data', function (req, res) {
  console.log(req.body)
  res.redirect('/')
  var myData = new User(req.body);
    myData.save()
})

