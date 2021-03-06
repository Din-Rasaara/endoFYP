var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
//mongoose.connect('mongodb://localhost/testdb');
config = {
    DB: 'mongodb://localhost:27017/testdb?replicaSet=rs',
};
mongoose.connect(config.DB, { useNewUrlParser: true }).then(
    () => {
        console.log('Database is connected');
    },
    (err) => {
        console.log('Can not connect to the database' + err);
    }
);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection Error:'));

var io = require('socket.io');
var server = require('http').createServer(app);

var socket = io(server);
//create an event listener
//To listen to messages
socket.on('connection', (client) => {
    console.log('user connected');
    client.on('message', async (msg) => {
        openChangeStream(msg);
        console.log(msg);
        socket.emit('name', msg);
    });
    client.on('disconnect', () => {
        console.log('user disconnected');
    });
});

db.once('open', () => {
    server.listen(3000, () => {
        console.log('listening on *:3000');
    });
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/form.html');
});

app.get('/plots', function (req, res) {
    res.sendFile(__dirname + '/plots_page.html');
});

app.get('/results', function (req, res) {
    res.sendFile(__dirname + '/results.html');
});

app.get('/printresults', function (req, res) {
    res.sendFile(__dirname + '/view_plots.html');
    const MongoClient = require('mongodb').MongoClient;
    const url = 'mongodb://localhost:27017/testdb';
    const dbName = 'testdb';
    socket.on('connection', (client) => {
        console.log('user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
    MongoClient.connect(url)
        .then((client) => {
            const db = client.db(dbName);
            const col = db.collection('testc');
            col.find({})
                .toArray()
                .then((docs) => {
                    // logs message upon finding collection
                    console.log(docs[0]);
                    socket.emit('server', docs[0]);
                    console.log('message emitted');
                });
            client.close(() => console.log('connection closed'));
        })
        .catch((err) => {
            console.log('error finding collection', err);
        })
        .catch((err) => {
            console.log('error connecting to mongodb', err);
        });
});

app.get('/patientslist', function (req, res) {
    res.sendFile(__dirname + '/table_page.html');
});

app.get('/Recording', function (req, res) {
    res.sendFile(__dirname + '/existing_recording.html');
});

app.post('/patient-data', function (req, res) {
    console.log(req.body);
    var myData = createNewUser(req.body);
    myData.save(function (err, results) {
        console.log(err);
        let uid = results._id;
        res.redirect('/plots?id=' + results.fname + results.lname);
    });
});
function createNewUser(data) {
    const nameSchema = new mongoose.Schema(
        {
            fname: String,
            lname: String,
            age: Number,
            height: Number,
            weight: Number,
            gender: String,
            phone: Number,
            condition: String,
            comment: String,
        },
        { collection: data.fname + data.lname }
    );
    const User = mongoose.model('User', nameSchema);
    return new User(data);
}
async function getName(uid) {
    let document = await User.findById(uid);
    console.log(document);
    return document.fname + ' ' + document.lname;
}

function openChangeStream(collection) {
    const taskCollection = db.collection(collection);
    const changeStream = taskCollection.watch();

    changeStream.on('change', (change) => {
        console.log(change);
        if (change.operationType === 'update') {
            socket.emit(collection, change.updateDescription);
            console.log(change.updateDescription);
        }
    });
}
