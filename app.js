const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/testdb");
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

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/patient-data", (req, res) => {
    var myData = new User(req.body);
    myData.save()
        .then(item => {
            res.redirect("/Plots");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});